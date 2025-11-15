import os
import argparse
import numpy as np
import pandas as pd
from typing import Optional


def generate_prognosis_csv(base_csv: str, output_csv: str, seed: int = 42, size_ratio: float = 0.25) -> pd.DataFrame:
    """
    Generate a deterministic prognosis dataset based on the first 3 rows for numeric columns
    and the full empirical distribution for categoricals. Writes prognosis-only rows to CSV.
    - Numeric: Normal(mu, sigma) estimated from first 3 rows (sigma fallback if 0)
    - Categorical: Sample from full-column value distribution (value_counts normalized)
    - years_employed: coerced to non-negative integers
    """
    rng = np.random.default_rng(seed)

    df = pd.read_csv(base_csv, sep=';')
    if df.empty:
        raise ValueError("Base dataset is empty")

    head = df.head(3)
    numeric_cols = head.select_dtypes(include=['number']).columns.tolist()
    cat_cols = [c for c in df.columns if c not in numeric_cols]

    add_n = max(1, int(round(size_ratio * len(df))))

    synth = {}

    for col in numeric_cols:
        vals = head[col].dropna().astype(float)
        mu = float(vals.mean()) if not vals.empty else 0.0
        sigma = float(vals.std()) if len(vals) > 1 else 0.0
        if sigma == 0.0:
            sigma = abs(mu) * 0.05 + 1e-6
        synth[col] = rng.normal(mu, sigma, size=add_n).astype(float)

    for col in cat_cols:
        base_vals = df[col].dropna()
        if base_vals.empty:
            synth[col] = [''] * add_n
            continue
        vc = base_vals.value_counts(normalize=True)
        choices = vc.index.tolist()
        probs = vc.values.tolist()
        synth[col] = rng.choice(choices, size=add_n, replace=True, p=probs)

    synth_df = pd.DataFrame(synth)

    for col in df.columns:
        if col not in synth_df.columns:
            synth_df[col] = np.nan
    synth_df = synth_df[df.columns]

    if 'years_employed' in synth_df.columns:
        try:
            synth_df['years_employed'] = np.maximum(0, np.rint(pd.to_numeric(synth_df['years_employed'], errors='coerce')).astype('Int64')).astype(int)
        except Exception:
            synth_df['years_employed'] = np.maximum(0, np.rint(synth_df['years_employed']).astype(int))

    for col in df.columns:
        if str(df[col].dtype) == 'bool' and str(synth_df[col].dtype) != 'bool':
            synth_df[col] = synth_df[col].astype(str).str.lower().isin(['true','1','yes','tak','ja','是','예'])


    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    synth_df.to_csv(output_csv, sep=';', index=False)
    return synth_df


def main(argv: Optional[list] = None):
    parser = argparse.ArgumentParser(description='Generate deterministic prognosis CSV for the app.')
    parser.add_argument('--base', type=str, default=None, help='Path to base CSV (default: app/models/part_of_loan_approval.csv)')
    parser.add_argument('--out', type=str, default=None, help='Output prognosis CSV (default: app/models/prognosis_loan_approval.csv)')
    parser.add_argument('--seed', type=int, default=42, help='Random seed for reproducibility')
    parser.add_argument('--ratio', type=float, default=0.25, help='Prognosis size ratio relative to base rows')
    args = parser.parse_args(argv)

    here = os.path.dirname(__file__)
    app_dir = os.path.dirname(here)  
    default_base = os.path.join(app_dir, 'models', 'part_of_loan_approval.csv')
    default_out = os.path.join(app_dir, 'models', 'prognosis_loan_approval.csv')

    base_csv = args.base or default_base
    out_csv = args.out or default_out

    df = generate_prognosis_csv(base_csv, out_csv, seed=args.seed, size_ratio=args.ratio)
    print(f"✓ Prognosis CSV written: {out_csv} ({len(df)} rows)")


if __name__ == '__main__':
    main()
