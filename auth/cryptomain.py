import base64

from cryptography.fernet import Fernet
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes

from functools import wraps

from flask import jsonify, request
from flask import redirect

from constant import mongo_read


def crypto_encrypted(auth_key):
    key = get_key('ng_rohit'.encode())
    f = Fernet(key)

    return str(f.encrypt(str(auth_key).encode()), 'utf-8')


def crypto_decrypted(auth_key):
    key = get_key('ng_rohit'.encode())
    f = Fernet(key)

    return str(f.decrypt(str(auth_key).encode()), 'utf-8')


def get_key(password):
    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(password)
    return base64.urlsafe_b64encode(digest.finalize())


def authenticate_user(bearer_token):
    auth_token = bearer_token.split(' ')[-1]
    try:
        decrypted_id = crypto_decrypted(auth_token)
    except:
        return {'success': False, 'message': 'Invalid auth token.'}
    return {'success': True, 'username': decrypted_id}


def authenticate_request(func):
    @wraps(func)
    def check_token(*args, **kwargs):
        request_type = request.headers.get("request_type", False)
        if 'Authorization' in request.headers.keys():
            auth_token = request.headers.get('Authorization')
        else:
            if request_type and request_type == "js":
                return jsonify({"success": False, "message": "Authentication Token Not Given!"})
            return redirect("/login")
            # return jsonify({'success': False, 'error_code': 101, 'message': 'Please pass a token for authentication'})

        username = authenticate_user(auth_token)
        if not username.get('success'):
            if request_type and request_type == "js":
                return jsonify(username)
            return redirect("/login")

        user = mongo_read['userSupportDetails'].find_one({"_id": username['username']})
        if not user:
            if request_type and request_type == "js":
                return jsonify({"success": False, "message": "Invalid Authentication Token"})
            return redirect("/login")
        return func(request, user)

    return check_token
def authenticate_request_admin(func):
    @wraps(func)
    def check_token(*args, **kwargs):
        request_type = request.headers.get("request_type", False)
        if 'Authorization' in request.headers.keys():
            auth_token = request.headers.get('Authorization')
        else:
            if request_type and request_type == "js":
                return jsonify({"success": False, "message": "Authentication Token Not Given!"})
            return redirect("/admin")
            # return jsonify({'success': False, 'error_code': 101, 'message': 'Please pass a token for authentication'})

        username = authenticate_user(auth_token)
        if not username.get('success'):
            if request_type and request_type == "js":
                return jsonify(username)
            return redirect("/admin")

        user = mongo_read['adminUserDetails'].find_one({"_id": username['username']})
        if not user:
            if request_type and request_type == "js":
                return jsonify({"success": False, "message": "Invalid Authentication Token"})
            return redirect("/admin")
        return func(request, user)

    return check_token
