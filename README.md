# SQL Generator From Diagram Python
<b>
	Backend
</b>
<br/>
<ul>
	<li>Python: ver. 3.12</li>
	<li>Flask: ver. 3.1.2</li>
	<li>Pandas: ver. 2.3.3</li>
	<li>NumPy: ver. 2.3.4</li>
</ul>
<br/>

<b>Installing dependencies</b>
<br/>
<p>
	To install all required libraries, make sure you are in the project directory (where the <code>requirements.txt</code> file is located) and run:
</p>

bash:
	pip install -r requirements.txt

<p>
	It is recommended to use a virtual environment (<code>venv</code> or <code>virtualenv</code>) before installing dependencies:
</p>

bash:
	python -m venv venv
	source venv/bin/activate        # Linux / macOS
	venv\Scripts\activate           # Windows
	pip install -r requirements.txt

<br/>
<b>Running the Flask server</b>
<br/>
<p>
	After installing all dependencies, you can start the Flask application with:
</p>

bash:
	python app.py

<p>
	Or, if your project uses an <code>app</code> package structure:
</p>

bash:
	flask --app app run

<p>
	By default, the Flask development server will be available at:
</p>

http://127.0.0.1:5000

<p>
	To run the app in debug mode (with automatic reload on code changes):
</p>

bash:
	flask --app app run --debug

<br/>
<b>
	Frontend
</b>
<br/>
<ul>
	<li>.</li>
</ul>
