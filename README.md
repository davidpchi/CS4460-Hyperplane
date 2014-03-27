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
* __firstname__
* __lastname__
* __gender__
* __state__
* __title__: If the legislator is a representative or senator
* __website__
* __imageURL__: deprecated and will remove
* __bills__: An array of bill objects that the legislator has created

Bill Data
------
The **billData** array contains the data organized by bill.
