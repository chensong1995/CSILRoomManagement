# SFU CSIL Room Management System
## Description
In CMPT courses at Simon Fraser University, teaching assistants use the "CS TA Room Bookings" system to book rooms for their office hours (http://www.cs.sfu.ca/CourseCentral/tabooking/). This system is obsolete, and we are developing a new system to replace it. This is a course project of CMPT 470 at SFU, instructed by Gregory Baker.

## Authors
* John Liu
* Chong Zhao
* Chen Song
* Ruiming Jia

## Authentication
* You can use SFU Computing ID to login.
* If you do not have an SFU Computing ID (this is probably because you are an external user), you will have to create a "CSIL account" on our website.
* Visit http://localhost:3000, you should be redirected to the authentication page

## CSIL Machine Live API
* Instructions for people who want to call this API:
   1. Please send a POST request to http://<our_url>/live
   2. Please use utf8 encoding
   3. Please make the request body as a JSON object, with:
     * room, e.g. "ASB9700", "ASB9804"
     * name, e.g. "a01", "a02"
     * time, an unix timestamp. E.g. 1499469022
   4. You will receive a 200 response if everything works well
* We have a sample client program implemented as /reporter/reporter.py