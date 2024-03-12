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
    'btats': 1,
    'nbtas': 2,
    "survsp": 3,
    "atmpr": 4,
    "btcsh": 5,
    "nbtcs": 6,
    "ejspr": 7
}

START_IDS = {
    "btats": "SUPPORT_BTATS_",
    "nbtas": "SUPPORT_NBTAS_",
    "survsp": "SUPPORT_SURVSP_",
    "atmpr": "SUPPORT_ATMPR_",
    "btcsh": "SUPPORT_BTCSH_",
    "nbtcs": "SUPPORT_NBTCS_",
    "ejspr": "SUPPORT_EJSPR_"
}

DISPLAY_DEPARTMENT_NAME = {
    'btats': "BTI ATM Support",
    'nbtas': "Non BTI ATM Support",
    "survsp": "Surveillance Support",
    "atmpr": "Atm Projects",
    "btcsh": "BTI Cash Support",
    "nbtcs": "Non BTI Cash Support",
    "ejspr": "EJ Support"
}


UN_ASSIGN_BTATS = "/unassign_query/btats_support_agent/query"
UN_ASSIGN_NBTAS = "/unassign_query/nbtas_support_agent/query"
UN_ASSIGN_SURVSP = "/unassign_query/survsp_support_agent/query"
UN_ASSIGN_ATMPR = "/unassign_query/atmpr_support_agent/query"
UN_ASSIGN_BTCSH = '/unassign_query/btcsh_support_agent/query'
UN_ASSIGN_NBTCS = '/unassign_query/nbtcs_support_agent/query'
UN_ASSIGN_EJSPR = '/unassign_query/ejspr_support_agent/query'

UN_ASSIGN_DICT = {
    'btats': UN_ASSIGN_BTATS,
    'nbtas': UN_ASSIGN_NBTAS,
    "survsp": UN_ASSIGN_SURVSP,
    "atmpr": UN_ASSIGN_ATMPR,
    'btcsh': UN_ASSIGN_BTCSH,
    'nbtcs': UN_ASSIGN_NBTCS,
    "ejspr": UN_ASSIGN_EJSPR
}

BTATS_ACTIVE = "/btats_support_agent/{}/activequery"
NBTAS_ACTIVE = "/nbtas_support_agent/{}/activequery"
SURVSP_ACTIVE = "/survsp_support_agent/{}/activequery"
ATMPR_ACTIVE = "/atmpr_support_agent/{}/activequery"
BTCSH_ACTIVE = '/btcsh_support_agent/{}/activequery'
NBTCS_ACTIVE = '/nbtcs_support_agent/{}/activequery'
EJSPR_ACTIVE = '/ejspr_support_agent/{}/activequery'


ACTIVE_QUERY_DICT = {
    "btats": BTATS_ACTIVE,
    "nbtas": NBTAS_ACTIVE,
    "survsp": SURVSP_ACTIVE,
    "atmpr": ATMPR_ACTIVE,
    "btcsh": BTCSH_ACTIVE,
    "nbtcs": NBTCS_ACTIVE,
    "ejspr": EJSPR_ACTIVE
}



# btats_support_agent
#nbtas_support_agent
#survsp_support_agent
#atmpr_support_agent
#btcsh_support_agent
#nbtcs_support_agent
#ejspr_support_agent

BTATS_RESOLVE = "/btats_support_agent/{}/resolvedquery"
NBTAS_RESOLVE = "/nbtas_support_agent/{}/resolvedquery"
SURVSP_RESOLVE = "/survsp_support_agent/{}/resolvedquery"
ATMPR_RESOLVE = "/atmpr_support_agent/{}/resolvedquery"
BTCSH_RESOLVE = "/btcsh_support_agent/{}/resolvedquery"
NBTCS_RESOLVE = "/nbtcs_support_agent/{}/resolvedquery"
EJSPR_RESOLVE = "/ejspr_support_agent/{}/resolvedquery"

RESOLVE_QUERY_DICT = {
    "btats": BTATS_RESOLVE,
    "nbtas": NBTAS_RESOLVE,
    "survsp": SURVSP_RESOLVE,
    "atmpr": ATMPR_RESOLVE,
    "btcsh": BTCSH_RESOLVE,
    "nbtcs": NBTCS_RESOLVE,
    "ejspr": EJSPR_RESOLVE
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
