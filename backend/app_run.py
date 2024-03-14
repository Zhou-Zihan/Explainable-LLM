from flask import Flask, jsonify, request, Blueprint, render_template, abort, send_from_directory



# Initialize the app
app = Flask(__name__)

def requestParse(req_data):
    """解析请求数据并以json形式返回"""
    if req_data.method == "POST":
        if req_data.json != None:
            data = req_data.json
        else:
            data = req_data.form
    elif req_data.method == "GET":
        data = req_data.args
    return data


llm = None


@app.route('/init', methods=['POST'])
# @cross_origin()
def init():
    print('----------------Init----------------')
    global llm
    if llm is not None:
        return jsonify({"message": " already initialized"})
    request_data = requestParse(request)
    return jsonify({"message": "init successfully"})


if __name__ == "__main__":
    # app.register_blueprint(datatone_routes.datatone_bp, url_prefix='/datatone')
    # app.register_blueprint(vleditor_routes.vleditor_bp, url_prefix='/vleditor')
    # app.register_blueprint(mmplot_routes.mmplot_bp, url_prefix='/mmplot')

    # app.register_blueprint(debugger_single_routes.debugger_single_bp, url_prefix='/debugger_single')
    # app.register_blueprint(debugger_batch_routes.debugger_batch_bp, url_prefix='/debugger_batch')
    # app.register_blueprint(vis_matrix_routes.vis_matrix_bp, url_prefix='/vis_matrix')
    # app.register_blueprint(test_queries_routes.test_queries_bp, url_prefix='/test_queries')
    # count_15m_intervals('2014-01-04 0:00', '2015-11-07 12:00')
    app.run(host='0.0.0.0', debug=True, threaded=True, port=8047)