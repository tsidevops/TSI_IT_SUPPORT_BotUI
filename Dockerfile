FROM python:3.6-stretch
ADD . .
RUN pip3 install -r requirements.txt
CMD python3 application.py