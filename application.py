from flask import Flask, jsonify, request, abort, render_template, redirect
from flask_cors import cross_origin
from auth.cryptomain import crypto_encrypted, crypto_decrypted, authenticate_request,authenticate_request_admin
# from constant import UN_ASSIGN_B2C, ACTIVE_QUERY_DICT, RESOLVE_QUERY_DICT, mongo_write, mongo_read, START_IDS, CHATS, \
#     BASE_URL_SERVER, UN_ASSIGN_DICT, DISPLAY_DEPARTMENT_NAME, ACCOUNT_LINK,MATCH_STATUS
from constant import (UN_ASSIGN_ATOP, UN_ASSIGN_ESRV, UN_ASSIGN_ATPR, UN_ASSIGN_CASH, UN_ASSIGN_EJMG, ACTIVE_QUERY_DICT,
                      RESOLVE_QUERY_DICT, mongo_write, mongo_read, START_IDS, CHATS, BASE_URL_SERVER, UN_ASSIGN_DICT, DISPLAY_DEPARTMENT_NAME, ACCOUNT_LINK, MATCH_STATUS)
import datetime
from uuid import uuid4
import json
import time
from datetime import datetime, timedelta
import pytz
from bson import json_util,ObjectId
# from firebase_utils.firebase_connection import add_user_active_status
from firebase_utils.firebase_connection import add_user_active_status

app = Flask(__name__,
            static_url_path='',
            static_folder='static',
            template_folder='templates')


# @app.route("/")
# def test():
#     return jsonify({"success": True, "time": datetime.datetime.utcnow(), "version": 1.1})


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# @app.route('/test')
# def test():
#     return jsonify({"success":True, "version": "K8S.1.11"})


@app.route("/logout", methods=["GET"])
def logout():
    return render_template("logout.html")


@app.route('/update_status', methods=["POST"])
@authenticate_request
def update_status(request, user):
    data = json.loads(request.data)
    support_match_id = user['support_id']
    is_online = data['is_online']
    chat_count = data['chat_count']
    name = user['name']
    support_type = ACCOUNT_LINK[user['department']]
    exe_data = mongo_read['ExeOnlineChatCount'].find_one({"_id": support_match_id})
    if exe_data:
        try:
            mongo_write['ExeOnlineChatCount'].update_one({'_id': support_match_id},
                                                         {'$set': {
                                                             "isOnline": is_online,
                                                             "chatCount": chat_count,
                                                             "updated_at": int(time.time()) * 1000,
                                                             "name": name
                                                         }}, upsert=True)
        except Exception as e:
            print( f"Error updating document: {e}")


    else:
        mongo_write['ExeOnlineChatCount'].insert_one({
            "_id": support_match_id,
            "isOnline": is_online,
            "chatCount": chat_count,
            "support_type": support_type,
            "create_at": int(time.time())*1000,
            "name": name
        })
    return {"success": True, "message": "status update successfully"}


@app.route("/dashboard_details", methods=["GET"])
@authenticate_request
def dashboard_details(request, user):
    # def dashboard_details():
    #     support_id = 'support_12345'
    support_id = user.get("support_id", False)
    # domain = 'b2c'
    domain = user.get("department", False)  # #
    active_query = ACTIVE_QUERY_DICT[domain].format(support_id)
    resolve_query = RESOLVE_QUERY_DICT[domain].format(support_id)
    context = {
        'un_assign_chat': UN_ASSIGN_DICT[domain],
        'support_id': support_id,
        'active_query': active_query,
        'resolve_query': resolve_query,
        "department": domain,
        'display_department': DISPLAY_DEPARTMENT_NAME[domain],
        "accept_chat_url": {
            "url": BASE_URL_SERVER + 'emt_assign_chat',
            "method": "POST"
        },
        "send_msg_url": {
            "url": BASE_URL_SERVER + "send_message_bot",
            "method": "POST"
        },
        'end_chat_url': {
            "url": BASE_URL_SERVER + "emt_assign_chat_end",
            "method": "POST"
        },
        'send_file_url': {
            "url": BASE_URL_SERVER + "send_file_bot",
            "method": "POST"
        },
        "transfer_chat_url": {
            "url": BASE_URL_SERVER + "emt_transfer_chat",
            "method": "POST"
        },
        'auto_chat_end_url': {
            "url": BASE_URL_SERVER + "auto_chat_end",
            "method": "POST"
        },
        "chat_endpoint": CHATS,
        "agent_name": user.get("name")
        # "agent_name": "Abhishek soni"
    }
    return jsonify({"success": True, "data": context})


@app.route("/change_password", methods=["POST", "GET"])
@cross_origin()
def change_password():
    if request.method == "POST":
        data = request.form
        if not data.get("current_password", False):
            return render_template('change_password.html', error="current password is required")
        if not data.get("new_password", False):
            return render_template('change_password.html', error="new password is required")
        if not data.get("token", False):
            return render_template('change_password.html', error="token is required")

        current_password = data.get("current_password")
        new_password = data.get("new_password")
        username = crypto_decrypted(data.get('token'))
        user = mongo_read['userSupportDetails'].find_one({"_id": username})
        if user:
            try:
                if current_password == crypto_decrypted(user.get("password")):
                    mongo_write['userSupportDetails'].update_one({'_id': username},
                                                                 {'$set': {"password": crypto_encrypted(new_password)}})
                    # request.headers['Authorization'] = "Bearer {}".format(crypto_encrypted(username))
                    return render_template('change_password.html', message="password changed successfully")

                else:
                    return render_template('change_password.html', error="Incorrect password")

            except Exception as e:
                app.logger.info(e)
                return render_template('change_password.html', error="Incorrect password")
        else:
            return render_template('change_password.html', error="Incorrect Username")

    elif request.method == "GET":
        return render_template('change_password.html')


@app.route("/login", methods=["POST", "GET"])
@cross_origin()
def login():
    if request.method == "POST":
        data = request.form
        if not data.get("username", False):
            return render_template('login.html', error="Username is required")
        if not data.get("password", False):
            return render_template('login.html', error="Password is required")

        username = data.get("username")
        password = data.get("password")
        user = mongo_read['userSupportDetails'].find_one({"_id": username,"active":True})
        if user:
            try:
                if password == crypto_decrypted(user.get("password")):
                    # request.headers['Authorization'] = "Bearer {}".format(crypto_encrypted(username))
                    return render_template('login_success.html', token=crypto_encrypted(username))
                    # return jsonify(
                    #     {"success": True, "message": "login successful", "token": crypto_encrypted(username)})
                else:
                    return render_template('login.html', error="Incorrect password")

            except Exception as e:
                app.logger.info(e)
                return render_template('login.html', error="Incorrect password")
        else:
            return render_template('login.html', error="Incorrect Username")

    elif request.method == "GET":
        return render_template('login.html')


@app.route("/signup", methods=["POST", "GET"])
@cross_origin()
def signup():
    if request.method == "POST":
        data = request.form
        if not data.get("name", False):
            return render_template('signup.html', error="Name is required")

        if not data.get("email", False):
            return render_template('signup.html', error="Email is required")

        if not data.get("gender", False):
            return render_template('signup.html', error="Gender is required")

        if not data.get("password", False):
            return render_template('signup.html', error="Password is required")

        if not data.get("department", False):
            return render_template('signup.html', error="Department is required")

        if not data.get("phone", False):
            return render_template('signup.html', error="Phone is required")

        name = data.get("name")
        email = data.get("email"),
        password = crypto_encrypted(data.get("password")),
        gender = data.get("gender"),
        department = data.get("department"),
        # print(department)
        # if department[0] == 'pro':
        if department[0] == 'atop' or department[0] == 'cash' :
            if data.get('sub_department') == "options":
                return render_template("signup.html", error="Please select Sub Department")

        sub_department = data.get("sub_department").replace("options", "")
        print(sub_department)
        print(department)
        phone = data.get("phone")
        if "options" in gender:
            return render_template("signup.html", error="Please Select Gender")

        if "options" in department:
            return render_template("signup.html", error="Please select Department")
        support_id = START_IDS[department[0]] + uuid4().hex
        #
        u = mongo_read['userSupportDetails'].find_one({"_id": email[0]})

        if u:
            return render_template('signup.html', error="Email Address Already register")

        else:
            mongo_write['userSupportDetails'].insert_one({"_id": email[0], "name": name, "password": password[0],
                                                          "gender": gender[0], "department": department[0],
                                                          "sub_department": sub_department,
                                                          "phone": phone, "is_email_verify": False,
                                                          "support_id": support_id,"active":True})

        return render_template('login_success.html', token=crypto_encrypted(email[0]))

    elif request.method == "GET":
        return render_template("signup.html")


@app.route("/corporate_register", methods=["POST", "GET"])
@cross_origin()
def corporate_register():
    if request.method == "POST":
        data = request.form
        if not data.get("name", False):
            return render_template('corporate_register.html', error="Name is required")

        if not data.get("email", False):
            return render_template('corporate_register.html', error="Email is required")

        if not data.get("phone", False):
            return render_template('corporate_register.html', error="Phone is required")

        if not data.get("user_type", False):
            return render_template('corporate_register.html', error="User Type is required")

        if not data.get("client_type", False):
            return render_template('corporate_register.html', error="Client Type is required")

        name = data.get("name")
        email = data.get("email"),
        user_type = data.get("user_type"),
        client_type = data.get("client_type"),
        phone = data.get("phone")
        if "options" in user_type:
            return render_template("corporate_register.html", error="Please Select User Type")

        if "options" in client_type:
            return render_template("corporate_register.html", error="Please select Client Type")
        print(user_type, client_type, email, name, phone)
        u = mongo_read['user_details'].find_one({"_id": phone})

        if u:
            return render_template('corporate_register.html', error="User Already register")

        else:
            mongo_write['user_details'].insert_one({"_id": phone, "name": name,
                                                    "email": email[0], "is_email_verify": False,
                                                    "user_type": user_type[0],
                                                    "client_type": client_type[0],
                                                    "created_at": datetime.datetime.utcnow()})

        return render_template('corporate_register_success.html')

    elif request.method == "GET":
        return render_template("corporate_register.html")

@app.route('/index_admin', methods=['GET'])
def index_admin():
    return render_template('index_admin.html')


@app.route("/logout_admin", methods=["GET"])
def logout_admin():
    return render_template("logout_admin.html")

@app.route("/admin", methods=["POST", "GET"])
@cross_origin()
def admin():
    if request.method == "POST":
        data = request.form
        if not data.get("username", False):
            return render_template('admin.html', error="Username is required")
        if not data.get("password", False):
            return render_template('admin.html', error="Password is required")

        username = data.get("username")
        password = data.get("password")
        user = mongo_read['adminUserDetails'].find_one({"_id": username,"active":True})
        if user:
            try:
                if password == crypto_decrypted(user.get("password")):
                    # request.headers['Authorization'] = "Bearer {}".format(crypto_encrypted(username))

                    usertype = "admin"
                    if usertype == "admin":
                        return render_template('login_success_admin.html', token=crypto_encrypted(username))
                    else:
                        return render_template('admin.html', error="No Admin Rights")
                    # return jsonify(
                    #     {"success": True, "message": "login successful", "token": crypto_encrypted(username)})
                else:
                    return render_template('admin.html', error="Incorrect password")

            except Exception as e:
                app.logger.info(e)
                return render_template('admin.html', error="Incorrect password")
        else:
            return render_template('admin.html', error="Incorrect Username")

    elif request.method == "GET":
        return render_template('admin.html')

@app.route("/dashboard_details_admin", methods=["GET","POST"])
@authenticate_request_admin
def dashboard_details_admin(request,user):
    # def dashboard_details():
    #     support_id = 'support_12345'
    data = request.form
    support_id = data.get("support_id", False);
    #loginuser=user

    #login_support_id = loginuser.get("support_id", False)
    # domain = 'b2c'
    user = mongo_read['userSupportDetails'].find_one({"support_id": support_id})
    domain = user.get("department", False)  # #
    active_query = ACTIVE_QUERY_DICT[domain].format(support_id)
    resolve_query = RESOLVE_QUERY_DICT[domain].format(support_id)
    context = {
        'un_assign_chat': UN_ASSIGN_DICT[domain],
        'support_id': support_id,
        'active_query': active_query,
        'resolve_query': resolve_query,
        "department": domain,
        'display_department': DISPLAY_DEPARTMENT_NAME[domain],
        "accept_chat_url": {
            "url": BASE_URL_SERVER + 'emt_assign_chat',
            "method": "POST"
        },
        "send_msg_url": {
            "url": BASE_URL_SERVER + "send_message_bot",
            "method": "POST"
        },
        'end_chat_url': {
            "url": BASE_URL_SERVER + "emt_assign_chat_end",
            "method": "POST"
        },
        'send_file_url': {
            "url": BASE_URL_SERVER + "send_file_bot",
            "method": "POST"
        },
        "transfer_chat_url": {
            "url": BASE_URL_SERVER + "emt_transfer_chat",
            "method": "POST"
        },
        'auto_chat_end_url': {
            "url": BASE_URL_SERVER + "auto_chat_end",
            "method": "POST"
        },
        "chat_endpoint": CHATS,
        "agent_name": user.get("name")
        # "agent_name": "Abhishek soni"
    }
    return jsonify({"success": True, "data": context})

@app.route("/get_department_users", methods=["POST", "GET"])
@cross_origin()
def get_department_users():

    data = request.form
    department_id = data.get("departmentid", False)
    musers=mongo_read['userSupportDetails'].find({"department": department_id},
                                                { "_id": 1,"support_id": 1,"name":1,"phone":1,"gender":1,
                                                  "department":1,"active":1, "sub_department": 1
                                                })
    users=[]
    for user in musers:
        resolve_query = RESOLVE_QUERY_DICT[department_id].format(user.get("support_id"))
        user["resolve_query"]=resolve_query
        users.append(user)

    context = {
        "users": users,
        'un_assign_chat': UN_ASSIGN_DICT[department_id]

    }
    return jsonify({"success": True, "data": context})

@app.route("/get_departments", methods=["POST", "GET"])
@authenticate_request_admin
def get_departments(request,user):

    login_user_detail={}
    login_support_id = user.get("support_id", False)
    name = user.get("name", False)
    login_user_detail['login_support_id']=login_support_id
    login_user_detail['name'] = name

    context = {
        'admin_departments': DISPLAY_DEPARTMENT_NAME,
        'login_user_detail':login_user_detail

    }
    return jsonify({"success": True, "data": context})

@app.route("/get_chats_search", methods=["POST", "GET"])
@authenticate_request_admin
def get_chats_search(request,user):

    data = request.form
    searchtext = data.get("searchtext", False)
    searchtype=data.get("searchtype", False)
    fobj={"user_id": "123"}
    if searchtype=="Mobile Number":
        fobj={"user_id": searchtext}

    if searchtype == "Email/Phone":
            fobj = {"email_phone": searchtext}

    if searchtype == "Booking Id/PNR":
        fobj = {"booking_id": searchtext}

    if searchtype == "Chat Id":
        validId = ObjectId.is_valid(searchtext)
        if validId == True:
            fobj = {"_id": ObjectId(searchtext)}


    f_chats=mongo_read['UserMatchHistory'].find(fobj)

    r_chats = []
    for doc in f_chats:
        doc["_id"] = str(doc["_id"])
        support_id=doc.get("support_user_id")
        if support_id:
            user = mongo_read['userSupportDetails'].find_one({"support_id": support_id})
            if user:
                doc["agent_name"]=user.get("name")
        r_chats.append(doc)

    context = {
        "chats": r_chats,
        "chat_endpoint": CHATS


    }
    return jsonify({"success": True, "data": context})

@app.route('/index_productivity', methods=['GET'])
def index_productivity():
    return render_template('index_productivity.html')

@app.route("/get_productivity_report", methods=["POST", "GET"])
#@authenticate_request_admin
#def get_productivity_report(request,user):
def get_productivity_report():
    data = request.form
    startDate = data.get("startDate", False)
    endDate = data.get("endDate", False)
    searchtype=data.get("searchtype", False)
    departmentid=data.get("department", False)
    fobj={"user_id": "123"}
    if searchtype == "Last Hour":
        delta = datetime.utcnow() - timedelta(minutes=60)
        fobj={"match_time" : {"$gt": datetime.strptime(delta.isoformat(), "%Y-%m-%dT%H:%M:%S.%f")},"chat_type":departmentid+"_support"}

    if searchtype != "Last Hour":
            start_date_time_iso=datetime.strptime(startDate, "%Y-%m-%dT%H:%M:%SZ")
            end_date_time_iso = datetime.strptime(endDate, "%Y-%m-%dT%H:%M:%SZ")
            fobj = {"match_time": {"$gt":start_date_time_iso,"$lt":end_date_time_iso},"chat_type":departmentid+"_support"}

    #fobj={"support_user_id":"0c06fd50238d477ba4ae3843fa9bb227"}

    pipeline_total_assigned = [{"$match": fobj }, 
    
       {
    "$lookup": {
        "from": "userSupportDetails",
        "localField":"support_user_id",
        "foreignField":"support_id",
        "as": "to_support_user_id"
    }
        },
                {
            "$unwind": "$to_support_user_id"
        },

   {
    "$lookup": {
        "from": "ExeOnlineChatCount",
        "localField":"support_user_id",
        "foreignField":"_id",
        "as": "exeStatus"
    }
        },
                {
            "$unwind": "$exeStatus"
        },


        {
            "$project":{
                "exename":"$to_support_user_id.name",
                "exe_isonline":"$exeStatus.isOnline",
                "_id":1,
                "support_user_id":1,
                "match_status":1,
                "lastReplyBy":1,
                "firstAvgResTime": 1,
                "allAvgResTime": 1

            }
        },
    
    {
    "$group": {
        "exename":{
            "$first":  "$exename"
        },
        "exe_isonline":{
            "$first": "$exe_isonline"
        },
        "_id": {
            "support_user_id": "$support_user_id",
            "match_status": "$match_status",
            "lastReplyBy": "$lastReplyBy",
            "exename": "$to_support_user_id.name",
            "exe_isonline": "$exeStatus.isOnline"
        },
        "ChatCount": {
            "$sum": 1
        },
        "firstAvgResTime": {"$avg": {"$toDecimal": "$firstAvgResTime"}},
        "allAvgResTime": {"$avg": {"$toDecimal": "$allAvgResTime"}}
    }
        }, {
    "$group": {
        "Executive Name": {
            "$first":"$exename"
        },
        "exe_isonline": {
            "$first":"$exe_isonline"
        },
        "_id": "$_id.support_user_id",
        "chats_detail": {
            "$push": {
                "match_status": "$_id.match_status",
                "lastReplyBy": "$_id.lastReplyBy",
                "count": "$ChatCount"
            }
        },
        "TotalCount": {
            "$sum": "$ChatCount"
        },
        "Average Response Time (First Response)": {"$avg":{ "$trunc": ["$firstAvgResTime"] }},
        "Average Response Time (All Responses)": {"$avg":{ "$trunc": ["$allAvgResTime"] }}
    }
}, {
        "$sort": {
        "_id": 1
    }
        }]
    total_assigned_data = mongo_read['UserMatchHistory'].aggregate(pipeline_total_assigned)
    r_total_assigned_data = []
    for doc in total_assigned_data:
        ended_by_executive=0
        ended_by_customer = 0
        auto_solved=0
        auto_close=0
        total_assigned=0
        last_reply_by_executive = 0
        last_reply_by_customer = 0

        if 'chats_detail' in doc:
            for sts in doc['chats_detail']:
                if 'match_status' and 'lastReplyBy' in sts:
                    match_status = str(sts['match_status'])
                    lastReplyBy= sts['lastReplyBy']
                    if match_status=="3" and lastReplyBy=="Agent":
                        last_reply_by_executive = sts['count']
                        # doc["Total Solved  (Last reply by Executive)"] = sts['count']
                        ended_by_executive+=sts['count']
                    if match_status == "3" and lastReplyBy == "Customer":
                        last_reply_by_customer = sts['count']
                        # doc["Total Solved  (Last reply by Customer)"] = sts['count']
                        ended_by_executive += sts['count']
                    if match_status == "5" and (lastReplyBy == "Customer" or lastReplyBy=="Agent"):
                        auto_close += sts['count']

                else :
                    if 'match_status' in sts:
                        match_status = sts['match_status']
                        if match_status == 1:
                            total_assigned+=sts['count']
                        else:
                            if match_status==4:
                                ended_by_customer+=sts['count']
                            else:
                                if match_status==2:
                                    auto_solved+=sts['count']
                                else:
                                    if match_status == 5:
                                        auto_close += sts['count']
                                    else:
                                        status = MATCH_STATUS.get(match_status)
                                        doc[status] = sts['count']

        doc["Total Assigned"]=total_assigned
        doc["Total Solved"] = ended_by_executive+ended_by_customer+auto_solved+auto_close
        doc["Total Solved (Ended by Executive)"]=ended_by_executive
        doc["Total Solved (Ended by Customer)"]=ended_by_customer
        doc["Total Solved (Auto Solved)"]=auto_solved
        doc["Total Solved (Auto Closed)"] = auto_close
        doc["Total Solved  (Last reply by Executive)"] = last_reply_by_executive
        doc["Total Solved  (Last reply by Customer)"] = last_reply_by_customer

        if doc['exe_isonline'] == 1:
            doc["Current Status"] = "Online"
        else:
            doc["Current Status"] = "Going Away"

        # if '_id' in doc:
            # support_id = doc['_id']
            # user = mongo_read['userSupportDetails'].find_one({"support_id": support_id})
            # if user:
            #     doc["Executive Name"]=user.get("name")
            # else:
            #     doc["Executive Name"]=support_id

            # userst = mongo_read['ExeOnlineChatCount'].find_one({"_id": support_id})
            # if userst:
            #     IsOnlineStatus=userst.get("isOnline")
            #     if IsOnlineStatus == 1:
            #             doc["Current Status"] = "Online"
            #     else:
            #         doc["Current Status"] = "Going Away"
            # else:
            #     doc["Current Status"] = "Going Away"


        avg_first_response=str(doc["Average Response Time (First Response)"])
        avg_all_responsse=str(doc["Average Response Time (All Responses)"])
        if '.' in avg_first_response:
            doc["Average Response Time (First Response)"]=avg_first_response[0:avg_first_response.index('.') + 3]
        else:
            doc["Average Response Time (First Response)"] = avg_first_response
        if '.' in avg_all_responsse:
            doc["Average Response Time (All Responses)"] = avg_all_responsse[0:avg_all_responsse.index('.') + 3]
        else:
            doc["Average Response Time (All Responses)"]=avg_all_responsse
        
        if(doc["Average Response Time (First Response)"]=="NaN"):
            doc["Average Response Time (First Response)"] = "None"
        
        if(doc["Average Response Time (All Responses)"]=="NaN"):
            doc["Average Response Time (All Responses)"] = "None"
        
        r_total_assigned_data.append(doc)


    context = {
        "total_assigned_data": r_total_assigned_data,

    }
    return jsonify({"success": True, "data": context})

@app.route("/auth_admin", methods=["POST", "GET"])
@authenticate_request_admin
def auth_admin(request,user):
    return jsonify({"success": True, "data": {}})

@app.route('/index_usermanagement', methods=['GET'])
def index_usermanagement():
    return render_template('index_usermanagement.html')
@app.route("/update_user_detail", methods=["POST"])
@authenticate_request_admin
def update_user_detail(request,user):
    if request.method == "POST":
        data = request.form

        if not data.get("name", False):
            return jsonify({"message": "Name is required", "data": {}})
        if not data.get("email", False):
            return jsonify({"message": "Email is required", "data": {}})
        if not data.get("gender", False):
            return jsonify({"message": "Gender is required", "data": {}})

        if not data.get("department", False):
            return jsonify({"message": "Department is required", "data": {}})

        if not data.get("phone", False):
            return jsonify({"message":"Phone is required","data": {}})

        action_type = data.get("action_type", False)

        login_id = user.get("_id", False)
        name = data.get("name")
        email = data.get("email"),
        gender = data.get("gender"),
        department = data.get("department"),
        sub_department = data.get("sub_department"),
        phone = data.get("phone")
        active = parseStringBool(data.get("active"))

        if action_type=="add":
            if not data.get("password", False):
                return jsonify({"message": "Password is required", "data": {}})
            password = crypto_encrypted(data.get("password"))
            sub_department=''
            support_id = START_IDS[department[0]] + uuid4().hex



        u = mongo_read['userSupportDetails'].find_one({"_id": email[0]})
        if u and action_type=="update":
            data = {"name": name,
                    "phone": phone,
                    "gender": gender[0],
                    "department": department[0],
                    "sub_department": sub_department[0],
                    "active": active,
                    "update_time":datetime.utcnow(),
                    "update_by":login_id

                    }
            mongo_write['userSupportDetails'].update_one({'_id': email[0]},
                                                       {'$set': data}, upsert=True)

        if u and action_type=="add":
            return jsonify({"message": "Email Address Already register", "data": {}})

        elif action_type=="add":
            mongo_write['userSupportDetails'].insert_one({"_id": email[0], "name": name, "password": password,
                                                              "gender": gender[0], "department": department[0],
                                                              "sub_department": sub_department,
                                                              "phone": phone, "is_email_verify": False,
                                                              "support_id": support_id,"active":active})


        return jsonify({"success": True, "data": {}})

@app.route("/get_admin_users", methods=["POST", "GET"])
@cross_origin()
def get_admin_users():

    #data = request.form

    musers = mongo_read['adminUserDetails'].find({},
                                                   {"_id": 1, "support_id": 1, "name": 1, "phone": 1,
                                                    "gender": 1,
                                                    "active": 1
                                                    })
    users = []
    for user in musers:
       users.append(user)

    context = {
        "users": users

    }
    return jsonify({"success": True, "data": context})

@app.route('/index_usermanagement_admin', methods=['GET'])
def index_usermanagement_admin():
    return render_template('index_usermanagement_admin.html')
@app.route("/update_user_detail_admin", methods=["POST"])
@authenticate_request_admin
def update_user_detail_admin(request,user):
    if request.method == "POST":
        data = request.form

        if not data.get("name", False):
            return jsonify({"message": "Name is required", "data": {}})
        if not data.get("email", False):
            return jsonify({"message": "Email is required", "data": {}})
        if not data.get("gender", False):
            return jsonify({"message": "Gender is required", "data": {}})


        if not data.get("phone", False):
            return jsonify({"message":"Phone is required","data": {}})

        action_type = data.get("action_type", False)

        login_id = user.get("_id", False)
        name = data.get("name")
        email = data.get("email"),
        gender = data.get("gender"),
        phone = data.get("phone")
        active = parseStringBool(data.get("active"))

        if action_type=="add":
            if not data.get("password", False):
                return jsonify({"message": "Password is required", "data": {}})
            password = crypto_encrypted(data.get("password"))
            sub_department=''
            support_id = START_IDS['atop'] + uuid4().hex



        u = mongo_read['adminUserDetails'].find_one({"_id": email[0]})
        if u and action_type=="update":
            data = {"name": name,
                    "phone": phone,
                    "gender": gender[0],
                    "active": active,
                    "update_time":datetime.utcnow(),
                    "update_by":login_id

                    }
            mongo_write['adminUserDetails'].update_one({'_id': email[0]},
                                                       {'$set': data}, upsert=True)

        if u and action_type=="add":
            return jsonify({"message": "Email Address Already register", "data": {}})

        elif action_type=="add":
            mongo_write['adminUserDetails'].insert_one({"_id": email[0], "name": name, "password": password,
                                                              "gender": gender[0],
                                                              "phone": phone, "is_email_verify": False,
                                                              "support_id": support_id,"active":active})


        return jsonify({"success": True, "data": {}})
def parseStringBool(theString):
  return theString[0].upper()=='T'

@app.route("/chat_info", methods=["POST"])
def chat_info():
    data = request.form
    support_user_id = data.get("support_user_id", False)
    colName = data.get("colName", False)
    searchtype=data.get("searchtype", False)
    startDate = data.get("startDate", False)
    endDate = data.get("endDate", False)
    departmentid = data.get("department", False)
    
    fobj={"user_id": "123"}
    if searchtype == "Last Hour":
        delta = datetime.utcnow() - timedelta(minutes=60)
        fobj={"match_time" : {"$gt": datetime.strptime(delta.isoformat(), "%Y-%m-%dT%H:%M:%S.%f")},"chat_type":departmentid+"_support"}

    if searchtype != "Last Hour":
        start_date_time_iso=datetime.strptime(startDate, "%Y-%m-%dT%H:%M:%SZ")
        end_date_time_iso = datetime.strptime(endDate, "%Y-%m-%dT%H:%M:%SZ")
        fobj = {"match_time": {"$gt":start_date_time_iso,"$lt":end_date_time_iso},"chat_type":departmentid+"_support"}

    lastReplyByData=""
    
    if colName == "Total Assigned":
        match_status = 1
    else:
        if colName == "Total Solved (Ended by Customer)":
            match_status = 4
        else:
            if colName == "Total Solved (Auto Solved)":
                match_status = 2
            else:
                if colName == "Total Solved (Auto Closed)":
                    match_status = 5
                else:
                    if colName == "Total Solved":
                        match_status = {'$in':[2,3,4,5]}
                    else:
                        if colName == "Total Solved  (Last reply by Executive)":
                            match_status = 3
                            lastReplyByData = "Agent"
                        else:
                            if colName == "Total Solved  (Last reply by Customer)":
                                match_status = 3
                                lastReplyByData = "Customer"
                            else:
                                if colName == "Total Solved (Ended by Executive)":
                                    match_status = 3
                                    lastReplyByData = {'$in':['Agent','Customer']}
                                else:
                                    match_status = -1

    if(lastReplyByData!=""):
        fobj["lastReplyBy"]= lastReplyByData
    
    fobj["match_status"]= match_status
    fobj["support_user_id"] = support_user_id
    musers=mongo_read['UserMatchHistory'].find(fobj).sort("_id", 1)

    
    r_total_assigned_data = []

    for doc in musers:
        doc['_id'] = str(doc['_id'])
        # doc['Booking Id'] = doc['booking_id']
        # doc['User Type'] = doc['user_type']
        # doc['User Id'] = doc['user_id']
        # doc['Email'] = doc['email_phone']
        # doc['Auto Assign'] = doc['isAutoAssign']
        # doc['Matched Time'] = doc['match_time']
        # doc['Created Time'] = doc['create_time']
        r_total_assigned_data.append(doc)

    context = {
        "clientId": support_user_id,
        "colName": colName,
        "match_status": match_status,
        "fobj":fobj,
        "json_docs":r_total_assigned_data
    }
    return jsonify({"success": True, "data": context})

# Transfer Index Productivity Route
@app.route('/transfer_index_productivity', methods=['GET'])
def transfer_index_productivity():
    return render_template('transfer_index_productivity.html')

# Transfer report data collection route
@app.route("/get_transfer_productivity_report", methods=["POST", "GET"])
def get_transfer_productivity_report():
    data = request.form
    startDate = data.get("startDate", False)
    endDate = data.get("endDate", False)
    searchtype=data.get("searchtype", False)
    departmentid=data.get("department", False)
    fobj={"user_id": "123"}
    if searchtype == "Last Hour":
        delta = datetime.utcnow() - timedelta(minutes=60)
        fobj={"create_time" : {"$gt": datetime.strptime(delta.isoformat(), "%Y-%m-%dT%H:%M:%S.%f")},"from_chat_type":departmentid+"_support"}

    if searchtype != "Last Hour":
            start_date_time_iso=datetime.strptime(startDate, "%Y-%m-%dT%H:%M:%SZ")
            end_date_time_iso = datetime.strptime(endDate, "%Y-%m-%dT%H:%M:%SZ")
            fobj = {"create_time": {"$gt":start_date_time_iso,"$lt":end_date_time_iso},"from_chat_type":departmentid+"_support"}

    pipeline_total_assigned = [
        {
            "$match": fobj
        },
        {
    "$lookup": {
        "from": "userSupportDetails",
        "localField":"from_support_user_id",
        "foreignField":"support_id",
        "as": "from_support_user_id"
    }
        },
        {
    "$lookup": {
        "from": "userSupportDetails",
        "localField":"to_support_user_id",
        "foreignField":"support_id",
        "as": "to_support_user_id"
    }
        },
        {
            "$unwind": "$from_support_user_id"
        },
        {
            "$unwind": "$to_support_user_id"
        },
        {
            "$project":{
                "from_support_user_id":"$from_support_user_id.name",
                "to_support_user_id":"$to_support_user_id.name",
                "_id":1,
                "user_id":1,
                "user_type":1,
                "from_support_type":1,
                "from_chat_type":1,
                "from_support_sub_type":1,
                "support_match_id":1,
                "to_support_type":1,
                "to_chat_type":1,
                "to_support_sub_type":1,
                "create_time":1
            }
        },
    ]
    musers = mongo_read['UserChatTransferHistory'].aggregate(pipeline_total_assigned)

    r_total_assigned_data = []
    for doc in musers:
        doc['_id'] = str(doc['_id'])
        r_total_assigned_data.append(doc)

    context = {
        "total_assigned_data": r_total_assigned_data,
    }
    return jsonify({"success": True, "data": context})

# Json template editor route
@app.route("/get_template",methods=["GET"])
def get_template():
    return render_template('template_data.html')

# category & subcategory template data fetching msgTemplateData
@app.route("/msgTemplateData",methods=["POST"])
def msgTemplateData():
    pipelined =[
        {
            "$lookup": {
                "from": "subCategoryTemplate",
                "localField":"_id",
                "foreignField":"parentCatId",
                "as": "subData"
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ]
    musers = mongo_read['categoryTemplate'].aggregate(pipelined)
    
    r_total_assigned_data = []

    for doc in musers:
        newData = {}
        newData['id'] = str(doc['_id'])
        newData['catName'] = doc['catName']

        sub_total_assigned_data = []

        for subdoc in doc['subData']:
            subData = {}

            subData['id'] = str(subdoc['_id'])
            subData['subCatName'] = subdoc['subCatName']
            subData['parentCatId'] = str(subdoc['parentCatId'])
            subData['data'] = subdoc['textmsg']
            
            sub_total_assigned_data.append(subData)

        newData['subData'] = sub_total_assigned_data
        r_total_assigned_data.append(newData)

    return jsonify({"success": True, "data": r_total_assigned_data})

@app.route("/msgTemplateAddCategory",methods=["POST"])
def msgTemplateAddCategory():
    data = request.form
    catName = data.get("catName")
    print(catName)
    mongo_write['categoryTemplate'].insert_one({
            "catName": catName
        })

    return jsonify({"success": True, "data": {}})

@app.route("/msgTemplateAddSubCategory",methods=["POST"])
def msgTemplateAddSubCategory():
    data = request.form
    parentCatId = data.get("parentCatId")
    subCatName = data.get("subCatName")
    textmsg = data.get("textmsg")
    print(parentCatId)
    print(subCatName)
    print(textmsg)
    mongo_write['subCategoryTemplate'].insert_one({
            "parentCatId": ObjectId(parentCatId),
            "subCatName": subCatName,
            "textmsg": textmsg
        })
    return jsonify({"success": True, "data": {}})

@app.route("/msgTemplateDeleteCategory",methods=["POST"])
def msgTemplateDeleteCategory():
    data = request.form
    _id = data.get("_id")
    print(_id)
    mongo_write['categoryTemplate'].delete_one({'_id': ObjectId(_id)})
    return jsonify({"success": True, "data": {}})

@app.route("/msgTemplateDeleteSubCategory",methods=["POST"])
def msgTemplateDeleteSubCategory():
    data = request.form
    _id = data.get("_id")
    print(_id)
    mongo_write['subCategoryTemplate'].delete_one({'_id': ObjectId(_id)})
    return jsonify({"success": True, "data": {}})

@app.route("/msgTemplateEditCategory",methods=["POST"])
def msgTemplateEditCategory():
    data = request.form
    _id = data.get("_id")
    catName = data.get("catName")
    print(_id)
    print(catName)
    mongo_write['categoryTemplate'].update_one({'_id': ObjectId(_id)},
                                                     {'$set': {
                                                         "catName": catName
                              }})
    return jsonify({"success": True, "data": {}})

@app.route("/msgTemplateEditSubCategory",methods=["POST"])
def msgTemplateEditSubCategory():
    data = request.form
    _id = data.get("_id")
    subCatName = data.get("subCatName")
    textmsg = data.get("textmsg")
    print(_id)
    print(subCatName)
    print(textmsg)
    mongo_write['subCategoryTemplate'].update_one({'_id': ObjectId(_id)},
                                                    {'$set': {
                                                         "subCatName": subCatName,
                                                         "textmsg": textmsg
                                                           }
                                                    })
    return jsonify({"success": True, "data": {}})

if __name__ == "__main__":
    app.run(debug=True, port=4008, host="127.0.0.1")
