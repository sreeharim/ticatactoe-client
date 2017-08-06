var app = angular.module("tttApp",[])
				.controller("tttController",function($scope){
					var gameBoard = [{zero:'',one:'',two:'',id:'r1'},
									 {zero:'',one:'',two:'',id:'r2'},
									 {zero:'',one:'',two:'',id:'r3'}
									];
					$scope.gameBoard = gameBoard;
					$scope.isMyTurn = false;
					$scope.loggedIn = false;
					$scope.validMove =false;
					$scope.isBiddingTime =false;
					$scope.isBidSubmitted=false;
					$scope.myBid='';
					$scope.mySubBid='';
					$scope.oppSubtBid='';
					$scope.message = "Waiting for an opponent...";
					$scope.socket = io.connect('http://192.168.0.4:3000');
					$scope.name="";
					$scope.opponentConnected = false;
					$scope.opponentDisConnected = false;
					$scope.opponent=""; 
					$scope.coins='';
					$scope.opponentCoins='';
					$scope.invalidUsrMsg= '';
					$scope.bidEnded= false;
					$scope.gameOver = false;
					$scope.socket.on('registered user',function(data){
								console.log(data);
								$scope.loggedIn = true;
								$scope.$apply();
								});
					$scope.socket.on('update board',function(data){
								$scope.gameBoard = data;
								 $scope.$apply();
								});
					
					$scope.socket.on('opponent connected',function(data){
								 console.log(data);
								 $scope.opponentConnected = true;
								 $scope.opponentDisConnected = false;
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
					$scope.submitChange = function(row,key) {
							$scope.validMove = false;
        					$scope.gameBoard = $scope.updateGameBoard($scope.gameBoard,row,key,$scope.value);
        					if($scope.validMove)
								$scope.socket.emit('submit move',$scope.gameBoard);
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
    					$scope.socket.emit('register',$scope.name);
    				}
    				$scope.clearErr = function(){
    					$scope.invalidUsrMsg='';
    				}
    				$scope.newGame = function(){
    					clearBoard();
    					$scope.gameOver = false;
    					$scope.socket.emit('new game','');
    					$scope.message = "Waiting for an opponent...";
    					$scope.opponentConnected = false;
						$scope.opponentDisConnected = false;	
    				}
    				$scope.submitBid = function(){
    					$scope.socket.emit('submit bid',$scope.myBid);
    					$scope.isBidSubmitted = true;
    				}
    				function clearBoard(){
    					for(var row in $scope.gameBoard){
    						$scope.gameBoard[row].zero='';
    						$scope.gameBoard[row].one='';
    						$scope.gameBoard[row].two='';
    					}
    				}


				});