# SFU CSIL Room Management System
## Description
* In CMPT courses at Simon Fraser University, teaching assistants use the "CS TA Room Bookings" system to book rooms for their office hours (http://www.cs.sfu.ca/CourseCentral/tabooking/). This system is obsolete, and we developed a new system to replace it. This is a course project of CMPT 470 at SFU, instructed by Gregory Baker.

## Authors
* John Liu
* Chong Zhao
	* In this project, I am working on the room booking module. This module allows users to create bookings and manages their bookings. I also developed an auto-notification system that will send email notifications to users 30 minutes before their booking starts. 
* Chen Song
  * Hi, I am a third year student at SFU. I am part of the SFU-ZJU Computing Science Dual Degree Program. My student number is 301324024.
  * In this project, I am responsible for the authentication module, the announcement module, and the lab policy module. Together with John Liu, I developed the machine live status module (I implemented the back end, while John implemented the front end). I also created the email module together with Ruiming Jia.
* Ruiming Jia
  * Hi, I am a fourth year computing science student at SFU. I am responsible for the feedback/report violation module in this project.

## Authentication
* Users have to log in before they can visit our website. We developed two authentication systems, and they are used together. Students, teaching assistants, and faculties can log in through the SFU Central Authentication Service using their Computing ID. External users, such as a company that would like to host a job fair in the CSIL, can create and log in with a "CSIL account".

### SFU Central Authentication Service
* SFU Central Authentication Service (CAS) is a web application provided by SFU (https://www.sfu.ca/itservices/publishing/publish_howto/enhanced_web_publishing/cas/cas_for_programmers.html). The pipeline of an authentication request can be summarized as:
  1. The user visits our login page.
  2. The user chooses the SFU CAS option, and be redirected to a SFU CAS page with a GET parameter indicating our website.
  3. The user enters the username and password on the SFU CAS page. This generates a POST request from the user to the CAS server.
  4. If the user enters the username and password correctly, he or she will be redirected to our website with a GET parameter known as the "ticket number".
  5. Our website generates a POST request to the CAS server with the ticket number. 
  6. The CAS server will respond us with information about whether the ticket number is valid. 
  7. The user is logged in if the ticket number is valid.
* Passwords are stored on the CAS server instead of our server. 

### CSIL Accounts
* We also created our own authentication service to allow external users to use our system. Passwords are stored on our server using the bcrypt encryption.

### User Information
* We store the following information for each user:
  1. Username
  2. Email address
  3. Account Source (SFU Central Authentication Service, or CSIL Account)
  4. Wants email notifications or not
  5. Biography
  6. User group

### User Groups
* There are four different user groups:
  1. Admin
  2. Student
  3. TA
  4. Instructor
* Different user groups have different privileges, which can be edited by users with administrative privileges:
  1. Whether or not the user group has administrative privileges.
  2. The maximum number of concurrent bookings. Concurrent bookings are defined as two or more bookings with time conflicts.

### Administrative Privileges
* Users with administrative privileges can do the following:
  1. Edit/Create an announcement
  2. Edit the CSIL policy
  3. View and reply to everyone's feedback
  4. Change the privileges of user groups
  5. Move a user from one user group to another
  6. Mark a room as "under maintenance"
  7. Edit/Delete a booking record

## Security
* Passwords of CSIL accounts are stored using the bcrypt encryption algorithm. 
* All forms are protected by CSRF tokens, with the exception of:
  1. The password changing form. It is not protected because users have to enter the old password.
  2. The Machine Live Status API. It is not protected because we are not able to send clients CSRF tokens. We discussed with Professor Gregory Baker about the possibility of using secret keys. However, this will not work either, since the API uses unencrypted HTTP protocol.

## CSIL Machine Live Status
* This module allows users to know the availability of each workstation in the CSIL. A workstation is available if it is logged out (no one is using it), and is occupied if it is logged in.
* The back end of this module is implemented as an HTTP API. To deploy this service, one should make HTTP requests from the workstations in CSIL once logged in. Instructions for people who want to call this API:
  1. Please send a POST request to http://localhost/live:8080 every 10 seconds (Change localhost to your domain name if you want to deploy this project)
  2. In the request body, please include these parameters:
    * room, e.g. "ASB9700", "ASB9804"
    * machine name, e.g. "a01", "a02"
    * time, an unix timestamp. E.g. 1499469022
  3. You will receive a 200 response if everything works well
  4. After your request is received, the availability of the machine will be updated in no more than 1 minute
  5. A sample client program is implemented as /reporter/reporter.py

## Bookings

In the booking system, users can book a room for a particular period. Users can also make batch bookings, for example, one can book a room for 2:00 pm to 3:00 pm every Monday. Calendar GUI and table views are both provided. Users can book a room and manage their booking records. 

### Book a room
Users can choose a room by clicking the corresponding grid. If a grid is yellow, it means the room is under maintenance, while green grids represent available rooms.  Users can check the calendar of every room, but they can only book an available room. 

For each room, the website uses a calendar to display all its booking records. Batch bookings are colored by green, while regular bookings are colored by blue. Users can choose a period and create a booking record. A title is required for each booking. If the user decides to make a batch booking, he must specify a date when this booking starts, a date when this booking ends. The user also has to declare on which days of a week this booking will happen. 

### Manage bookings

Users can check all their bookings through Manage Bookings page. Although Non-administrative users are not allowed to edit their bookings, they can delete their bookings. 

### My Calendar

Our system provides each user with a calendar view. Users can check or delete their bookings through the calendar view if they prefer calendar GUI to the table view.

## Announcements
* This module allows administrators to make announcements to all users. Each announcement is stored as an HTML string in the database, and can be edited by the tinymce editor (https://www.tinymce.com/).
* We already imported the real announcements from http://www.sfu.ca/computing/about/support/csil.html to our system.

## Lab Policies
* The policy module is implemented as a special announcement. It is separated as a standalone module because lab policies are different from announcements semantically.

## iCal feed
Our system generates iCal feed for each user. A user can use this iCal feed in their calendar Apps. Our iCal feed supports Google Calendar, iCal, Outlook, etc. 

##Email notification
Our system supports email notifications in booking system, user profile system, including cancle booking, booking confirmation, booking reminder(30 minutes before your booking), sign-up confirmation, and password changing notification.
Administrators will receive a email if users send a message in feedback section, and administrator can decide to reply to the user by email or our system.

##Feedback
Our system allows users send feedbacks, report violations to administrators. 

### Different views for user and administrator
Users can see his/her previous messages sent to administator, and messages replied from administrator. User can click to reply to a specefic message from administrator. 
Administrators can see messages from all users, and click to reply to a specific message to the user. If the user reply to the message to administrator again, there will be a previous message section to clearly find out the topic.

### Report Violation
Users can click on any machine to report the person sitting there, the system will automatically generate a message in the text area: "Reporting user at #{MachineRoom}: #{reportMachine} for the following reason(s):", just fill out the message and click send.