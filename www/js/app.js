var app = angular.module("tttApp",[])
				.controller("tttController",function($scope){
					var gameBoard = [{zero:'',one:'',two:'',id:'r1'},
									 {zero:'',one:'',two:'',id:'r2'},
									 {zero:'',one:'',two:'',id:'r3'}
									];
					$scope.rules = ['Both players start off with 100 coins',
									'For each move, the players submit a silent bid',
									'The player who made the highest bid gets the chance to play',
									'The player who lost the bid gets the difference of bid coins',
                                    'If the game ends in a tie, the number of coins will determine the winner'] 
                    $scope.showRules = false;                
					$scope.gameBoard = gameBoard;
					$scope.isMyTurn = false;
					$scope.loggedIn = false;
					$scope.validMove =false;
					$scope.isBiddingTime =false;
					$scope.isBidSubmitted=false;
					$scope.connectToUser = false;
					$scope.myBid='';
					$scope.mySubBid='';
					$scope.oppSubtBid='';
					$scope.message = "";
					$scope.socket =io.connect('https://powerful-journey-47434.herokuapp.com/');
					//$scope.socket =io.connect('http://192.168.0.4:3000');
					$scope.name="";
					$scope.opponentConnected = false;
					$scope.opponentDisConnected = false;
					$scope.opponent=""; 
					$scope.coins='';
					$scope.opponentCoins='';
					$scope.invalidUsrMsg= '';
					$scope.bidEnded= false;
					$scope.gameOver = false;
					$scope.reqScreen= false;
					$scope.loading = false;
					$scope.reqName ='';
					$scope.reqMsg ='';
					$scope.users=[];
					$scope.requesting=false;
					$scope.socket.on('registered user',function(data){
								//console.log(data);
								$scope.loading  = false;
								$scope.loggedIn = true;
								$scope.$apply();
								});
					$scope.socket.on('update board',function(data){
								$scope.gameBoard = data;
								 $scope.$apply();
								});
					$scope.socket.on('update users',function(data){
								for(var d in data)
									if(data[d].name == $scope.name){
										data.splice(d,1);
										break;
									}
								$scope.users = data;
								if($scope.connectToUser)
								 	$scope.showUsers();	
								 $scope.$apply();
								});
					$scope.socket.on('remove users',function(data){
								for(var d in $scope.users)
									if($scope.users[d].name == data.name1){
										$scope.users.splice(d,1);
										break;
									}
								for(var d in $scope.users)
									if($scope.users[d].name == data.name2){
										$scope.users.splice(d,1);
										break;
									}
								 if($scope.connectToUser)
								 	$scope.showUsers();	
								 $scope.$apply();
								});
					$scope.socket.on('show users',function(data){
								//$scope.message = "Choose a player";
								$scope.showUsers();
								$scope.$apply();
								});
					$scope.socket.on('declined req',function(data){
								$scope.message = $scope.reqName+" rejected request:(";
								 $scope.reqName='';
								 $scope.opponentConnected =false;
								 $scope.opponentDisConnected =false;
								 $scope.requesting=false;
								 $scope.$apply();
								});
					
					$scope.socket.on('opponent connected',function(data){
								 console.log(data);
								 clearBoard();
								 $scope.opponentConnected = true;
								 $scope.reqScreen = false;
								 $scope.opponentDisConnected = false;
								 $scope.opponentLeft= false;
								 $scope.requesting=false;
								 $scope.gameOver = false;
								 $scope.opponent = data.pair;
								 $scope.opponentCoins=data.pairCoins;
								 $scope.isMyTurn = data.turn;
								 $scope.value = data.val;
								 $scope.coins = data.coins;
								 $scope.message = $scope.opponent+" connected";
								 $scope.$apply();
								});
					$scope.socket.on('opponent disconnected',function(data){
								$scope.isMyTurn = false;
								$scope.opponentConnected = false;
								$scope.opponentDisConnected = true;
								$scope.message= data;
								$scope.isBiddingTime=false;
								$scope.$apply();
					});
					$scope.socket.on('opponent left',function(data){
								$scope.opponentLeft= true;
								$scope.requesting=false;
								$scope.message= data;
								$scope.$apply();
					});

					$scope.socket.on('your turn',function(data){
								console.log('Your turn:' + data);
								$scope.isMyTurn = data;
								if(data)
									$scope.message = 'Your turn';
								else
									$scope.message = "Waiting..";
								 $scope.$apply();
								});
					$scope.socket.on('invalid name',function(data){
						$scope.invalidUsrMsg=data;
						$scope.name='';
						$scope.$apply();
					});
					$scope.socket.on('game over',function(data){
						$scope.gameOver = true;
						$scope.message=data;
						$scope.$apply();
					});
					$scope.socket.on('prompt bid',function(data){
						$scope.isBidSubmitted = false;
						$scope.isBiddingTime=true;
						$scope.bidEnded= false;
						$scope.message=data;
						$scope.$apply();
					});
					$scope.socket.on('wait opponent bid',function(data){
						$scope.message="Waiting for "+$scope.opponent+"'s bid";
						$scope.$apply();
					});
					$scope.socket.on('end bid',function(data){
						$scope.isBiddingTime=false;
						$scope.wonBid='';
						$scope.lostBid='';
						$scope.myBid='';
						$scope.$apply();
					});
					$scope.socket.on('lost bid',function(data){
						$scope.opponentCoins=data.pairCoins;
						$scope.bidEnded= true;
						$scope.coins = data.coins;
						$scope.oppSubtBid=data.wonBid;
						$scope.mySubBid=data.lostBid;
						$scope.message = 'You lost Bid';
						$scope.$apply();
					});
					$scope.socket.on('won bid',function(data){
						$scope.opponentCoins=data.pairCoins;
						$scope.bidEnded= true;
						$scope.coins = data.coins;
						$scope.mySubBid=data.wonBid;
						$scope.oppSubtBid=data.lostBid;
						$scope.message = 'You won Bid';
						$scope.$apply();
					});	
					$scope.socket.on('request game',function(data){
						clearBoard();
						$scope.reqScreen= true;
						$scope.connectToUser = false;
						$scope.gameOver = false;
						$scope.opponentConnected=false;
						$scope.opponentDisconnected=false;
						$scope.reqMsg = data+' requests a game.'
						$scope.reqName = data;
						$scope.message = '';
						$scope.$apply();
						//$scope.message = 'You won Bid';
					});	
					$scope.socket.on('cancelling req',function(data){
						$scope.connectToUser=true;
    					$scope.reqScreen= false;
    					$scope.opponentConnected = false;
					});
					$scope.submitChange = function(row,key) {
							$scope.validMove = false;
        					$scope.gameBoard = $scope.updateGameBoard($scope.gameBoard,row,key,$scope.value);
        					if($scope.validMove)
								$scope.socket.emit('submit move',$scope.gameBoard);
    						}
    				$scope.showUsers = function() {
    						$scope.opponentConnected=false;
							$scope.opponentDisconnected=false;
							$scope.gameOver=false;
							if($scope.users.length == 0)	
								$scope.message = "No players available :("
							else
								$scope.message = "Choose a player";
							$scope.connectToUser = true;
    						}
    				$scope.updateGameBoard = function(gameBoard, row, key,val){
    					for(var gameRow in gameBoard)
							if(gameBoard[gameRow].id == row && gameBoard[gameRow][key] == ''){
								gameBoard[gameRow][key] = val;
								$scope.validMove = true;
								break;
								}
							return gameBoard;	
    				}
    				$scope.enterGame = function(){
    					$scope.loading = true;
    					$scope.socket.emit('register',$scope.name);
    				}
    				$scope.clearErr = function(){
    					$scope.invalidUsrMsg='';
    				}
    				$scope.endGame = function(){
    					clearBoard();
    					$scope.gameOver = false;
    					$scope.opponentConnected = false;
						$scope.opponentDisConnected = false;
						$scope.socket.emit('end game','');	
    				}
    				$scope.submitBid = function(){
    					$scope.socket.emit('submit bid',$scope.myBid);
    					$scope.isBidSubmitted = true;
    				}
    				$scope.sendGameReq =function(name){
    					clearBoard();
    					$scope.socket.emit('send req',name);
    					$scope.connectToUser=false;
    					$scope.requesting=true;
    					$scope.reqName=name;
    					$scope.message = "Requesting "+name+" for a game..."
    					//$scope.reqScreen =true;
    				}
    				$scope.tryAgain =function(){
    					$scope.socket.emit('send req',$scope.opponent);
    					$scope.message = "Requesting "+name+" for a game..."
    					//$scope.reqScreen =true;
    				}
    				$scope.sendReply =function(accept){
    					$scope.socket.emit('send resp',{'name':$scope.reqName ,'accept':accept});
    					$scope.reqName='';
    					if(!accept){
    						$scope.connectToUser=true;
    						$scope.reqScreen= false;
    						$scope.opponentConnected = false;
    						if($scope.users.length == 0)	
								$scope.message = "No users online :("
							else
								$scope.message = "Choose a player";
    					}
						else{
							clearBoard();
							$scope.reqScreen= false;
							$scope.connectToUser = false;
							$scope.gameOver = false;
							$scope.message=$scope.reqName+" connected";
						}
    				}
    				$scope.cancelReq=function(name){
    					$scope.requesting=false;
    					$scope.socket.emit('cancel req',name);
    				}
    				$scope.showHideRules=function(){
    					$scope.showRules = !$scope.showRules;
    				}
    				$scope.init=function(){
    					document.addEventListener("deviceready", onDeviceReady, false);
    				}
    				function onDeviceReady(){
    					document.addEventListener("backbutton", onBackKeyDown, false);
					}
					function onBackKeyDown(e){
						  e.preventDefault();
    					  navigator.notification.confirm("Are you sure you want to exit?", onConfirm, "", "Yes,No"); 
					}
					function onConfirm(button) {
    					if(button==2){//If User selected No, then we just do nothing
        					return;
    					}else{
        					navigator.app.exitApp();// Otherwise we quit the app.
    				}
}
    				function clearBoard(){
    					for(var row in $scope.gameBoard){
    						$scope.gameBoard[row].zero='';
    						$scope.gameBoard[row].one='';
    						$scope.gameBoard[row].two='';
    					}
    				}


				});