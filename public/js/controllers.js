

google.charts.load('current', {packages: ['corechart','line']});

google.setOnLoadCallback(function() {
  angular.bootstrap(document, ['myApp']);
});

app.controller('AppCtrl', function ($rootScope, $scope, $timeout, $mdSidenav, $log, $location, $mdDialog, $firebaseAuth, $firebaseObject, $http){
    
    
    var auth = $firebaseAuth();
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.setCustomParameters({
  //'prompt':'select_account',
  //'access_type':'offline'
});


    $scope.signIn=function(){
      firebase.auth().signInWithRedirect(provider);
    }
    
    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {

        // This gives you a Google Access Token. You can use it to access the Google API.
        var tokenn = result.credential.accessToken;
        $scope.token=tokenn;
        
        
    // ...
  }
  // The signed-in user info.
  //var user = result.user;
}).catch(function(error) {
  // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
  // ...
});
  
  firebase.auth().onAuthStateChanged(function(user) {//~ Main Method

  if (user) {
    // User is signed in.
    $rootScope.globaluser=user;
    $scope.username=user.displayName;
    $scope.useruid=user.uid;
    $scope.isAuth1=true;

    
    listUpcomingEvents();
    userSetUp();

    if($location.path()=="/login"){
    $timeout($location.path("/"),100);}
        
    else{}
      
}
  else {
    // No user is signed in.

    $scope.isAuth1=false;
    if($location.path()=="/login"){
    }
    else{ $timeout($location.path("/login"),400);}
    
  }
  

    function userSetUp(){
    var query= firebase.database().ref('Users').orderByKey();
    query.once('value', function(snapshot) {
      var uid = $scope.useruid;
      var x=snapshot.val();
      
if(x!=null){
  if (x.hasOwnProperty(uid)){
    console.log('Already in Databse')
    createPending();
  }
  else{
    console.log("not yet in database");
    console.log('adding to database');
    addUser(user);
  }
}
else{
    console.log("not yet in database");
    console.log('adding to database');
    addUser(user);
  }
  
  
  
}); 
    function addUser(user){
      
      var d = new Date();
      d=d.toString();
      aa=[{name:'one', age:13},{name:'two', age:15},{name:'three', age:50}];

      var userRef = firebase.database().ref().child('Users').child(user.uid);
      userRef.set({name: user.displayName, pevents: 'empty', sevents:'empty', date: d });
      createPending();
    }
    }




  });

  

  

    function listUpcomingEvents() {
      date=(new Date()).toISOString();
      $http({
  method: 'GET',
  url: 'https://www.googleapis.com/calendar/v3/calendars/calendarId/events',
  params: {
            calendarId:'primary',
            maxResults:10,
            singleEvents:true,
            showDeleted:false,
            timeMin: date,
            orderBy: 'startTime'
          },
  headers: {'Authorization': 'Bearer '+ $scope.token }
}).then(function successCallback(response) {
    // this callback will be called asynchronously
    // when the response is available
    
    $scope.resultz=response.data.items;
    
  }, function errorCallback(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
      }




  


    $scope.test=function(){
      var user = firebase.auth().currentUser;
      var userr = {
        uid: user.uid
      };
      var userRef = firebase.database().ref().child('Users').child(user.uid).child('sevents');
      userRef.set({eventname: 'gym', eventtime: '123', eventscore: 23, user: userr});

    };
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;

      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }

    function buildToggler(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }
    }


   /* var query= firebase.database().ref('Users/'+$scope.useruid).orderByKey();
    query.once('value', function(snapshot) {
    
      var x=snapshot.val();
      console.log(x);
          }); */



    
   function createPending() {
      var oldpending=getPending();
     var pastevents=getPastEvents();
      var scoredevents=getEvents();
      Promise.all([oldpending, scoredevents, pastevents]).then(function(result){
        console.log(result);
        var combinedevents=result[0].concat(result[1]);
        var combinedid=arraytoIds(combinedevents);
        var newpending=result[2].filter(function(val){
        if(!combinedid.includes(val.id)){
          return true;
        }
        });
      
      newpending.forEach(function(nevent){
        var userRef = firebase.database().ref('Users/'+$scope.useruid).child('pevents').child(nevent.id);
        userRef.set(nevent);
      });

      });
     /*var combinedevents=oldpending.concat(scoredevents);
     // var combinedid=arrayoIds(combinedevents);

      var newpending=pastevents.filter(function(val){
        if(!combinedid.includes(val.id)){
          return true;
        }
        });
          

           var userRef = firebase.database().ref().child('Users').child(user.uid).child('pevents');
      userRef.set(newpending);*/
   

         function getPending(){
          return new Promise(function(resolve, reject){
          var query= firebase.database().ref('Users/'+$scope.useruid+'/pevents').orderByKey();
          query.on('value',function(snapshot){
            
            if(snapshot.val()!=="empty"&&snapshot.val()!==null){
              $scope.val1=snapshot.val();
                resolve(snapshot.val());
              }
              else{
                $scope.val1=[];
              resolve([]);
              }
          });
          
            });
        }

        /*var promise = getEvents();
        promise.then(function(data){

        }).catch(function(error){

        });*/
        
          
          function getEvents(){
            return new Promise(function(resolve, reject){
              
              var query= firebase.database().ref('Users/'+$scope.useruid+'/'+'sevents').orderByKey();
          query.on('value',function(snapshot){
            if(snapshot.val()!=="empty"&&snapshot.val()!==null){
              $scope.val2=snapshot.val();
                resolve(snapshot.val());
              }
              else{
                $scope.val2=[];
              resolve([]);
              }

          });

            });
          
         }

         function arraytoIds(a){
          for( var i=0; i<a.length; i++){
            if(a[i].id){
            a[i]=a[i].id;
          }

          }
          return a;

         }




           function getPastEvents(){//week ago
            var date=(new Date());
           
            var lastdate=(new Date(date.getTime()-6.048e+8)).toISOString();
            date=date.toISOString();
            console.log(lastdate);
            return new Promise(function(resolve,reject){$http({
              method: 'GET',
              url: 'https://www.googleapis.com/calendar/v3/calendars/calendarId/events',
              params: {
                  calendarId:'primary',
                  maxResults:100,
                  singleEvents:true,
                  showDeleted:false,
                  timeMax: date,
                  timeMin: lastdate,
                  orderBy: 'startTime'
                },
              headers: {'Authorization': 'Bearer '+ $scope.token }
             }).then(function successCallback(response) {
          // this callback will be called asynchronously
          // when the response is available
          $scope.val3=response.data.items;
         // console.log(response.data.items);
         if(typeof response.data.items!== undefined){
          console.log(response.data.items);
                resolve(response.data.items);

          }
          else{
            resolve([]);
          }
          
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log("error");
          reject(Error('Error'));
            });
           });
           }
         }
     
      




      });



app.controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log, $location, $rootScope, $mdDialog, $firebaseAuth){
$scope.signOut=function(){
  $timeout(sign0ut(), 400);
}
var sign0ut=function(){
  firebase.auth().signOut().then(function() {
    console.log("signed out successfully");
  // Sign-out successful.
}, function(error) {
  console.log("error occured");
  // An error happened.
});
}

$scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });

    };
    $scope.showConfirm = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Are you sure you want to log out?')
          .textContent('You will be missed.')
          .ariaLabel('You will be missed')
          .targetEvent(ev)
          .ok('Logout')
          .cancel('Stay');

    $mdDialog.show(confirm).then(function() {
      $scope.close();
      $scope.signOut();
      
      //$scope.logOut();
    }, function() {
      $scope.close();

      $scope.status = 'You decided to keep your debt.';
    });
  };

   $scope.goHome=function(){
      $location.path("/");
      $scope.close();
      
    };
       $scope.goLogin=function(){
      $location.path("/login");
      $scope.close();
         
    };
       $scope.goAbout=function(){
      $location.path("/about");
      $scope.close();
          
    };
       $scope.goSettings=function(){
      $location.path("/settings");
       $scope.close();
         
    };



});
app.controller('GraphCtrl', function ($scope, $timeout, $location){
  //Line Graph, score% against date

   var data1 = new google.visualization.DataTable();
      data1.addColumn('date', 'Date');
      data1.addColumn('number', 'Rating');

      data1.addRows([
          [new Date(2015, 0, 1), 8],  [new Date(2015, 0, 2), 7],  [new Date(2015, 0, 3), 3],
          [new Date(2015, 0, 4), 1],  [new Date(2015, 0, 5), 3],  [new Date(2015, 0, 6), 6],
          [new Date(2015, 0, 7), 9]
          ]);

      var options1 = {
        chart: {
          title: 'Rate the day from 1 to 10',
          subtitle: 'Total score/date'
        },
        width: 500,
        height: 500,
        vAxis: {
          maxValue:10,
          minValue:0
        },
        hAxis:{}

      };

      var chart1 = new google.charts.Line(document.getElementById('linechart_material'));

      chart1.draw(data1, options1);
















  // Column Graph, # of events per day. total score per day
  //

   // Most Productive day.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Day');
        data.addColumn('number', 'Score');
        data.addRows([
          ['Sunday', 8],
          ['Monday', 5],
          ['Tuesday', 6],
          ['Wednesday', 4],
          ['Thursday', 3],
          ['Friday', 3],
          ['Saturday',2]
          ]);

        

        // Set chart options
        var options = {'title':'Which Day is most productive?',
                       'width':400,
                       'height':300,
                        is3D: true};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      
$scope.format;
  $scope.changeFormat= function(){

  }
$scope.data = [];
  $scope.data.cb1 = 'dissapear graph';
  $scope.data.cb2 = 'dissapear graph';
  $scope.data.cb3 = 'dissapear graph';


});
app.controller('PendingCtrl', function ($rootScope, $scope, $timeout, $location, $mdDialog){
	
/*Get Events Pending Score from Firebase*/

/* add scored events to firebase */
	$scope.sevents=[];

          var query= firebase.database().ref('Users/'+$rootScope.useruid+'/pevents').orderByKey();
          query.on('value',function(snapshot){
            console.log(snapshot.val());
            $scope.pevents=snapshot.val();
          });
          
            
        

	  $scope.showPrompt = function(ev,pevent) {
    // Appending dialog to document.body to cover sidenav in docs app
    console.log("clicked");
    var confirm = $mdDialog.prompt()
      .title('How would you rate this event? /n Event.name, Event.date')
      .textContent('Please rate from 1-5')
      .placeholder('Event Score')
      .ariaLabel('Event Score')
      .initialValue('0')
      .targetEvent(ev)
      .ok('Done!')
      .cancel("I didn't do this event :( ");

    $mdDialog.show(confirm).then(function(result) {
      console.log(pevent.eventname);
      var i = $scope.pevents.indexOf(pevent);

      console.log(i);
      $scope.pevents[i].score=result;
      
      console.log($scope.pevents[i]);
            console.log($scope.pevents[i].score);
            $scope.sevents.push($scope.pevents[i]);
      $scope.pevents.splice(i,1);
      console.log($scope.sevents);

      $scope.status = 'You decided to name your dog ' + result + '.';

    }, function() {
      $scope.test=false;
      $scope.status = 'You didn\'t name your dog.';
    });
  };



});


app.controller('UpcommingCtrl', function ($scope, $timeout, $location){


});






 
