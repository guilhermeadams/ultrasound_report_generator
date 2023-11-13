from flask import Flask, render_template, request, jsonify
import pandas as pd
import json

app = Flask(__name__)

# Path to the JSON file
json_file_path = '../code.json'

# Read the JSON data from the file
try:
    with open(json_file_path, 'r', encoding='utf-8') as file:
        json_data = json.load(file)
        data = pd.DataFrame(json_data)
        print("JSON data loaded and converted to DataFrame successfully!")
except Exception as e:
    print("Error loading or converting JSON to DataFrame:", e)
    exit()

# APP route index
@app.route('/')
def index():
    return render_template('index.html')

# Get codes by the organ in the json file (assuming the column name is 'estruturaData')
@app.route('/get_code_by_organ', methods=['GET'])
def get_code_by_organ():
    organ = request.args.get('organ')
    codes = data[data['estruturaData'] == organ]['code'].unique().tolist()
    return jsonify(codes)

# Get the report data from the json file for a specific code
@app.route('/get_report_data', methods=['GET'])
def get_report_data():
    code = request.args.get('code')
    report_data = data[data['code'] == code].to_dict(orient='records')
    if report_data:
        report = report_data[0]
        return jsonify({
            'comentarios': report.get('comentarios', ''),
            'impressaodiagnostica': report.get('impressaodiagnostica', ''),
            'normal': report.get('status', '').upper() == 'NORMAL',
            'anormal': report.get('status', '').upper() == 'ANORMAL'
        })
    return jsonify({})

if __name__ == '__main__':
    app.run(debug=True)