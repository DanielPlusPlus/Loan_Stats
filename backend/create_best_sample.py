import csv
import os

base_dir = os.path.dirname(__file__)
input_file = os.path.join(base_dir, 'app/models/loan_approval.csv')
output_file = os.path.join(base_dir, 'app/models/part_loan_approval_best.csv')

def create_best_sample():
    """
    Create a CSV file with 30 records:
    - 15 with high credit score (>=750) and loan approved
    - 15 with low credit score (<=400) and loan declined
    """

    high_score_approved = []
    low_score_declined = []

    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')

        for row in reader:
            credit_score = int(row['credit_score'])
            loan_approved = row['loan_approved'] == 'True'

            if credit_score >= 750 and loan_approved:
                high_score_approved.append(row)

            elif credit_score <= 400 and not loan_approved:
                low_score_declined.append(row)

    high_score_approved.sort(key=lambda x: int(x['credit_score']), reverse=True)
    low_score_declined.sort(key=lambda x: int(x['credit_score']))

    num_approved = min(15, len(high_score_approved))
    num_declined = min(15, len(low_score_declined))

    selected_records = high_score_approved[:num_approved] + low_score_declined[:num_declined]

    if selected_records:
        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            fieldnames = ['name', 'city', 'income', 'credit_score', 'loan_amount',
                         'years_employed', 'points', 'loan_approved']
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')

            writer.writeheader()
            writer.writerows(selected_records)

        print(f"✓ Created {output_file}")
        print(f"  - High credit score (approved): {num_approved} records")
        print(f"  - Low credit score (declined): {num_declined} records")
        print(f"  - Total: {len(selected_records)} records")
    else:
        print("✗ No matching records found")

"""
if __name__ == '__main__':
    create_best_sample()
"""