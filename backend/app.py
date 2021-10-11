import flask
from flask import request, jsonify
from flask_cors import CORS
import json
from urllib.parse import unquote
import requests
from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
# approach1 - using Cosine Similarity
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import sent_tokenize, word_tokenize
import unicodedata
# approach3 - using WordNet
from nltk.corpus import stopwords, wordnet
from itertools import product
import numpy
from urllib.parse import urlparse
import urllib
import re

# FLASK CONFIG
app = flask.Flask(__name__)
app.config["DEBUG"] = True
cors = CORS(app)

import pandas as pd

import numpy as np
from nltk import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import spacy
import os
from datetime import datetime

nlp = spacy.load('en_core_web_sm', disable=['parser', 'ner'])
vocabulary = joblib.load('Features_1.pkl')
Model = joblib.load("CovidModel_1.pkl")

import service

# HOME
@app.route('/', methods=['GET'])
def home():
    return "<h1>NLP based Analyzer</h1>"


@app.route('/Save', methods=['POST'])
def Save():
    user_decision = unquote(request.json.get('save', ""))
    user_email = unquote(request.json.get('email', ""))
    service.save_decision(user_email, user_decision)
    return "", 200


# ANALYZE POST REQ API
@app.route('/analyze', methods=['POST'])
def analyze_context():
    user_email = unquote(request.json.get('user_email', ""))
    article = unquote(request.json.get('article', ""))
    testData = unquote(request.json.get('test_data', ""))
    source_url = unquote(request.json.get('url', ""))
    algo = request.json.get('algo', 'wordnet')
    response = service.analyze(user_email, article, testData, source_url, algo)
    return response, 200

if __name__ == "__main__":
    # APP RUNSERVER
    app.run()



