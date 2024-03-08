import firebase_admin
import time
from datetime import timedelta, datetime
from firebase_admin import credentials, firestore

# Fetch the service account key JSON file contents

from constant import CREDENTIAL_FILE_APP_FIREBASE, FIREBASE_URL, mongo_read

cred = credentials.Certificate(CREDENTIAL_FILE_APP_FIREBASE)

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': FIREBASE_URL
})

db_firestore = firestore.client()


def add_user_active_status(support_match_id, is_online, chat_count, support_type):
    doc_ref = db_firestore.collection(u'ExeOnlineChatCount').document(support_match_id)
    data_store = {
        "_id": support_match_id,
        "isOnline": is_online,
        "chatCount": chat_count,
        "support_type": support_type
    }
    return doc_ref.set(data_store)


def get_all_closed_chat():
    data = mongo_read['UserMatchHistory'].find({"support_type": 4,
                                                "match_time": {'$gte': datetime.utcnow() - timedelta(hours=1)},
                                                "closing_time": {'$exists': True}}).count()
    print(data)
    # for i in data:
    #     support_id = i['support_id']
        # ref = db_firestore.collection(u'b2c_support_agent').document(support_id).collection(u'resolvedquery')
        # /b2c_support_agent/015dd3ae3b044dc29d69bebedbd8c6bf/resolvedquery
    pass

# get_all_closed_chat()