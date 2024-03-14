import urllib
import ssl
from pymongo import MongoClient
import os


MATCH_STATUS={
    0:'unassign',
    1:'assign/active',
    2:'end search(Ended by customer in unassign stage)',
    3:'end/close(Ended by support exe)',
    4:'end/close(Ended by customer)',
    5:'auto close'
}

ACCOUNT_LINK = {
    'atop': 1,
    'esrv': 2,
    "atpr": 3,
    "cash": 4,
    "ejmg": 5

}

# START_IDS = {
#     "btats": "SUPPORT_BTATS_",
#     "nbtas": "SUPPORT_NBTAS_",
#     "survsp": "SUPPORT_SURVSP_",
#     "atmpr": "SUPPORT_ATMPR_",
#     "btcsh": "SUPPORT_BTCSH_",
#     "nbtcs": "SUPPORT_NBTCS_",
#     "ejspr": "SUPPORT_EJSPR_"
# }

START_IDS = {
    "atop": "SUPPORT_ATOP_",
    "esrv": "SUPPORT_ESRV_",
    "atpr": "SUPPORT_ATPR_",
    "cash": "SUPPORT_CASH_",
    "ejmg": "SUPPORT_EJMG_"

}

# DISPLAY_DEPARTMENT_NAME = {
#     'btats': "BTI ATM Support",
#     'nbtas': "Non BTI ATM Support",
#     "survsp": "Surveillance Support",
#     "atmpr": "Atm Projects",
#     "btcsh": "BTI Cash Support",
#     "nbtcs": "Non BTI Cash Support",
#     "ejspr": "EJ Support"
# }

DISPLAY_DEPARTMENT_NAME = {
    'atop': "ATM Operations",
    'esrv': "E Surveillance",
    "atpr": "Atm Projects",
    "cash": "Cash Management",
    "ejmg": "EJ Management"
}


UN_ASSIGN_ATOP = "/unassign_query/atop_support_agent/query"
UN_ASSIGN_ESRV = "/unassign_query/esrv_support_agent/query"
UN_ASSIGN_ATPR = "/unassign_query/atpr_support_agent/query"
UN_ASSIGN_CASH = "/unassign_query/cash_support_agent/query"
UN_ASSIGN_EJMG = '/unassign_query/ejmg_support_agent/query'

UN_ASSIGN_DICT = {
    'atop': UN_ASSIGN_ATOP,
    'esrv': UN_ASSIGN_ESRV,
    "atpr": UN_ASSIGN_ATPR,
    "cash": UN_ASSIGN_CASH,
    'ejmg': UN_ASSIGN_EJMG

}


ATOP_ACTIVE = "/atop_support_agent/{}/activequery"
ESRV_ACTIVE = "/esrv_support_agent/{}/activequery"
ATPR_ACTIVE = "/atpr_support_agent/{}/activequery"
CASH_ACTIVE = "/cash_support_agent/{}/activequery"
EJMG_ACTIVE = '/ejmg_support_agent/{}/activequery'


ACTIVE_QUERY_DICT = {
    "atop": ATOP_ACTIVE,
    "esrv": ESRV_ACTIVE,
    "atpr": ATPR_ACTIVE,
    "cash": CASH_ACTIVE,
    "ejmg": EJMG_ACTIVE

}

#  atop esrv atpr  cash  ejmg
# ATOP ESRV ATPR CASH EJMG
# atop_support_agent  esrv_support_agent  atpr_support_agent  cash_support_agent  ejmg_support_agent


ATOP_RESOLVE = "/atop_support_agent/{}/resolvedquery"
ESRV_RESOLVE = "/esrv_support_agent/{}/resolvedquery"
ATPR_RESOLVE = "/atpr_support_agent/{}/resolvedquery"
CASH_RESOLVE = "/cash_support_agent/{}/resolvedquery"
EJMG_RESOLVE = "/ejmg_support_agent/{}/resolvedquery"


RESOLVE_QUERY_DICT = {
    "atop": ATOP_RESOLVE,
    "esrv": ESRV_RESOLVE,
    "atpr": ATPR_RESOLVE,
    "cash": CASH_RESOLVE,
    "ejmg": EJMG_RESOLVE
}

CHATS = "/chatdata/chats/"


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
mongo_read = client['tsi_it_bot']
mongo_write = client['tsi_it_bot']

############################### FIREBASE CREDENTIALS Live #########################

# CREDENTIAL_FILE_APP_FIREBASE = os.getcwd() + '/-firebase.json'
# FIREBASE_AUTH = ''
# FIREBASE_URL = 'https://.firebaseio.com'


CREDENTIAL_FILE_APP_FIREBASE = os.getcwd() + '/tsiitchatbot-firebase-adminsdk-2zjmm-26e2cdf159.json'  #config json file
FIREBASE_AUTH = 'laYfxsKIoSUVXaRIk6wLuMimehSSYNzgVPlYEdGF'  #database secret
FIREBASE_URL = 'https://tsiitchatbot-default-rtdb.firebaseio.com'  # databaseURL of firebase config
# Database secret: 7g6NnfDNjHfww00FkEAlkOswLbucHlasv2ZXiNTD

############################### FIREBASE CREDENTIALS TESTING #########################

# CREDENTIAL_FILE_APP_FIREBASE = os.getcwd() + '/emt-bot-test-firebase.json'
# FIREBASE_AUTH = 'b2ycWmQidDm6g7Q3IA4r7Lt25S0XRvFpP53QZfFm'
# FIREBASE_URL = 'https://emt-bot-test.firebaseio.com'





# BASE_URL_SERVER = "https:///"
BASE_URL_SERVER = "http://127.0.0.1:4002/"
