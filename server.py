from flask import Flask, request, jsonify, send_from_directory
import csv, os, json
from datetime import datetime

app = Flask(__name__, static_folder="static")

LOG_FILE = "toc_log.csv"
UNITS_FILE = "units.json"
SCHEMA_FILE = "schemas.json"


def load_json(path, default):
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default, f, indent=2)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def init_log():
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(["czas", "jednostka", "typ", "dane"])


def read_logs():
    rows = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            try:
                r["dane"] = json.loads(r["dane"])
            except:
                r["dane"] = {"INFO": "Stary wpis"}
            rows.append(r)
    return rows


def write_log(unit, typ, dane):
    czas = datetime.now().strftime("%d-%m %H:%M")
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([czas, unit, typ, json.dumps(dane, ensure_ascii=False)])


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/config")
def config():
    return jsonify({
        "units": load_json(UNITS_FILE, []),
        "schemas": load_json(SCHEMA_FILE, {})
    })

@app.route("/add", methods=["POST"])
def add():
    d = request.json
    write_log(d["unit"], d["type"], d["data"])
    return ("", 204)


@app.route("/logs")
def logs():
    return jsonify(read_logs())


if __name__ == "__main__":
    init_log()
    app.run(host="0.0.0.0", port=5000)