CS4460-Hyperplane
=================

CS 4460 Project

This project contains several data structures that are in turn displayed. Accessing these data structures are as follows

State Data
---------
The **stateData** array contains the data organized by states. Each element of stateData has access to the following: 
* __name__: The name of the state by abbreviation. This is the primaryID for navigating this data structure.
* __representativeCount__: The number of representatives of that state
* __senatorCount__: The number of senators of that state
* __billCount__: The number of bills of that state
* __representatives__: An array of all the representatives that come from that state. The elements of this array have the same attributes as the legislatorData data structure. 
* __senators__: An array of all the senators that come from that state. The elements of this array have the same attributes as the legislatorData data structure. 
* __bills__: An array of all the bills that come from that state

Legislator Data
-------
The **legislatorData** array contains the data organized by legislator. Each element of legislatorData has access to the following: 
* __bioguide_id__: The bioguide_id of the legislator. This is the primaryID for navigating this data structure. 
* __firstname__: The first name of the legislator
* __lastname__: The lastname of the legislator
* __gender__: The gender of the legislator
* __state__: The state the legislator is from
* __title__: If the legislator is a representative or senator
* __website__: The website of the legislator
* __imageURL__: deprecated and will remove
* __bills__: An array of bill objects that the legislator has created

Bill Data
------
The **billData** array contains the data organized by bill.
* __bill_type__: The origin of the bill (house or senate bill)
* __bill_type_label__: The origin of the bill abbreviated (house = H, senate = S)
* __current_status__: The current status of the bill
* __current_status_description__: A description of the current status of the bill
* __current_status_label__: A shorter description of the current status of the bill
* __display_number__: The bill type label and bill number
* __is_alive__: If the bill is still active or not
* __link__: A link to the bill itself
* __major_actions__: An array of major actions taken on this bill. Element 0, while Element 2 is a description of the action.
* __title__: The title of the bill
* __title_without_number__: The title of the bill without its bill number
* __sponsor__: The sponsor of the bill (has multiple attributes, see legislator data for a sample.
