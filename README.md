ONE-search
============

An AngularJS directive that allows you to create autocomplete boxes that pull data either locally from a controller constant or remotely from the server.

## How to use

### Install project files
Clone the project from https://github.com/atymchuk/one-search.git.

### Run the mock dat server
To install the node modules necessary to run the mock data server, goto the `server` directory and run `npm install` and run with `node server`.
The server should be running on your host machine's port #8888.

### Run the app server
* Run `bower install` in order to put angular to the `vendor` directory.
* To run the project you have to serve the root directory. On a unix/mac machine you may want to just run `python -m SimpleHTTPServer 80`.
* Open the server root url in the browser (index.html should be served).

### Locally supplied data source (has to come from controller)

```html
<one-search id="countries"
              placeholder="Search countries"
              throttle="200"
              localdata="countries"
              submitUrl="http://myserver.com/selectedCountries"
              searchfield="name"
              displayfield="name"
              valuefield="code"
              minlength="2"
              inputclass="form-control"/>
```

### Remotely supplied data source

```html
<one-search id="members"
              placeholder="Search members"
              throttle="400"
              url="http://myserver.com/api/members/find?s="
              submitUrl="http://myserver.com/api/members"
              searchfield="fullName"
              displayfield="fullName"
              valuefield="employeeId"
              inputclass="form-control"/>
```
