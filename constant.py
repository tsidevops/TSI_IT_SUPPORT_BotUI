import urllib
import ssl
from pymongo import MongoClient
import os


START_IDS = {
    "b2b": "SUPPORT_B2B_",
    "b2c": "SUPPORT_B2C_",
    "cor": "SUPPORT_COR_",
    "pro": "SUPPORT_PRO_",
    "ehs": "SUPPORT_EHS_",
    "etas": "SUPPORT_ETAS_"
}

UN_ASSIGN_B2B = "/unassign_query/b2b_support_agent/query"
UN_ASSIGN_B2C = "/unassign_query/b2c_support_agent/query"
UN_ASSIGN_CORPORATE = "/unassign_query/corporate_support_agent/query"
UN_ASSIGN_PROMOTIONAL = "/unassign_query/promotional_support_agent/query"
UN_ASSIGN_EHS = '/unassign_query/existing_hotel_support/query'
UN_ASSIGN_ETAS = '/unassign_query/existing_travel_agent_support/query'

B2B_ACTIVE = "/b2b_support_agent/{}/activequery"
B2B_RESOLVE = "/b2b_support_agent/{}/resolvedquery"

B2C_ACTIVE = "/b2c_support_agent/{}/activequery"
B2C_RESOLVE = "/b2c_support_agent/{}/resolvedquery"

CORPORATE_ACTIVE = "/corporate_support_agent/{}/activequery"
CORPORATE_RESOLVE = "/corporate_support_agent/{}/resolvedquery"

PROMOTION_ACTIVE = "/promotional_support_agent/{}/activequery"
PROMOTION_RESOLVE = "/promotional_support_agent/{}/resolvedquery"

EHS_ACTIVE = '/existing_hotel_support/{}/activequery'
EHS_RESOLVE = '/existing_hotel_support/{}/resolvedquery'

ETAS_ACTIVE = '/existing_travel_agent_support/{}/activequery'
ETAS_RESOLVE = 'existing_travel_agent_support/{}/resolvedquery'

CHATS = "/chatdata/chats/"

UN_ASSIGN_DICT = {
    'b2b': UN_ASSIGN_B2B,
    'b2c': UN_ASSIGN_B2C,
    "cor": UN_ASSIGN_CORPORATE,
    "pro": UN_ASSIGN_PROMOTIONAL,
    'ehs': UN_ASSIGN_EHS,
    'etas': UN_ASSIGN_ETAS
}

ACTIVE_QUERY_DICT = {
    "b2b": B2B_ACTIVE,
    "b2c": B2C_ACTIVE,
    "cor": CORPORATE_ACTIVE,
    "pro": PROMOTION_ACTIVE,
    "ehs": EHS_ACTIVE,
    "etas": ETAS_ACTIVE
}

RESOLVE_QUERY_DICT = {
    "b2b": B2B_RESOLVE,
    "b2c": B2C_RESOLVE,
    "cor": CORPORATE_RESOLVE,
    "pro": PROMOTION_RESOLVE,
    "ehs": EHS_RESOLVE,
    "etas": ETAS_RESOLVE
}

DISPLAY_DEPARTMENT_NAME = {
    'b2b': "B2B Support",
    'b2c': "B2C Support",
    "cor": "Corporate Support",
    "pro": "Promotional Support",
    "ehs": "Existing Hotel Support",
    "etas": "Existing Travel Agent Support"
}


# production url live
# mongo_username = ''
# mongo_password = ''
# mongoURI = f'mongodb+srv://{urllib.parse.quote(mongo_username)}:{urllib.parse.quote(mongo_password)}@-snuok.mongodb.net/test?retryWrites=true'
# client = MongoClient(mongoURI, ssl_cert_reqs=ssl.CERT_NONE)
# # client = {"emt_bot": {}}
# mongo_read = client['']
# mongo_write = client

# production url live
mongo_username = 'adminUser'
mongo_password = 'P@ssw0rd'
mongoURI = f'mongodb://{urllib.parse.quote(mongo_username)}:{urllib.parse.quote(mongo_password)}@172.16.0.151:27017/?authMechanism=DEFAULT&authSource=admin'
client = MongoClient(mongoURI, ssl_cert_reqs=ssl.CERT_NONE)
# client = {"emt_bot": {}}
mongo_read = client['m_bot']
mongo_write = client['m_bot']

############################### FIREBASE CREDENTIALS Live #########################

# CREDENTIAL_FILE_APP_FIREBASE = os.getcwd() + '/-firebase.json'
# FIREBASE_AUTH = ''
# FIREBASE_URL = 'https://.firebaseio.com'


CREDENTIAL_FILE_APP_FIREBASE = os.getcwd() + '/tsitestchatsol-firebase-adminsdk-9rw20-1ca1de6a98.json'
FIREBASE_AUTH = '7g6NnfDNjHfww00FkEAlkOswLbucHlasv2ZXiNTD'
FIREBASE_URL = 'https://tsitestchatsol-default-rtdb.asia-southeast1.firebasedatabase.app'
# Database secret: 7g6NnfDNjHfww00FkEAlkOswLbucHlasv2ZXiNTD

############################### FIREBASE CREDENTIALS TESTING #########################

# CREDENTIAL_FILE_APP_FIREBASE = os.getcwd() + '/emt-bot-test-firebase.json'
# FIREBASE_AUTH = 'b2ycWmQidDm6g7Q3IA4r7Lt25S0XRvFpP53QZfFm'
# FIREBASE_URL = 'https://emt-bot-test.firebaseio.com'

ACCOUNT_LINK = {
    'pro': 1,
    'cor': 2,
    "b2b": 3,
    "b2c": 4,
    "ehs": 5,
    "etas": 6
}

MATCH_STATUS={
    0:'unassign',
    1:'assign/active',
    2:'end search(Ended by customer in unassign stage)',
    3:'end/close(Ended by support exe)',
    4:'end/close(Ended by customer)',
    5:'auto close'
}

# BASE_URL_SERVER = "https:///"
BASE_URL_SERVER = "http://127.0.0.1:4001/"
