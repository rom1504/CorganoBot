var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var navigatePlugin = require('mineflayer-navigate')(mineflayer);





var auction = { list:
  { "Redstone Dust": 15,
    "Wither Skeleton Head": 85,
    "Iron Ingot": 85,
    "Block of Iron": 800,
    "Gold Ingot": 85,
    "Block of Gold": 800,
    "Glowstone Block": 12,
    "Hopper": 450,
    "Diamond": 400,
    "Oak Log": 60,
    "Cobblestone": 30/64,
    "Stone Brick": 40/64,
    "Circle Stone Brick": 70/64,
    "Grass": 18,
    "Bone": 0.2,
    "Dirt": 18,
    "Sand": 5,
    "Spawn Egg": 5,
    "Pumpkin": 70/64,
    "Emerald": 18,
    "Soulsand": 220 },
  "doBid": 0,
  "delay": 800,
  "item": "none",
  "count": 0,
  "sec": 0,
  "bidStart": 0,
  "bid": 0,
  "inc": 0 }




if(process.argv.length < 4) {
  console.log("Usage : node digger.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "digger",
  password: process.argv[5],
  verbose: true,
});

// only enable auctions for one bot. God help us all if two of these ran on the same server...
if (process.argv[4] == "mcorganobot@gmail.com" || process.argv[4] == "skythegirl@mail.com") {
  //~ console.log("Adding Auctiond detectors")
  bot.chatAddPattern(/^Auction > [^ ]* is auctioning (\d+) (.+) for (?:\d+ min, )?\d+ sec ?\. Starting bid: \$(\d+) ?\. Bid increment: \$(\d+) ?\./, "auctionStart", "Fadedsb auction");
  bot.chatAddPattern(/^Auction > [^ ]+ (?:raised the bid to|has bid) \$([\.\d]+)/, "auctionBid", "Fadedsb auction");
  bot.chatAddPattern(/^Auction > Auction has (\d+) sec remaining/, "auctionTime", "Fadedsb auction");
  bot.chatAddPattern(/^Auction > ([^ ]+) won the auction for (.*) with \$(\d+)/, "auctionWon", "Fadedsb auction");
  bot.chatAddPattern(/^Auction > The auction ended/, "auctionEnd", "Fadedsb auction");
}

bot.chatAddPattern(/^\[.*\] ?([^\]:]*) ?: ?(.*)$/, "chat", "epicsb chat");
bot.chatAddPattern(/^\[.*?(\w*) -> me \] (.*)$/, "whisper", "essentials whisper");
bot.chatAddPattern(/^.*?(\w*) has requested (?:to teleport to you|that you teleport to them)\.$/, "tpRequest", "epicsb tpa request");
bot.chatAddPattern(/^(\w*) wants you to join a party. Use \/island join to accept the request$/, "addRequest", "epicsb add to island request");
bot.chatAddPattern(/^Balance\: $([\d\.]+)$/, "balance", "Balance");

var masters = ["djrockster", "MCorgano", "TheBuzzSaw", "MCorBit", "rubic_red"]
var fiveMins = 0
var tenMins = 0
setInterval(function(){ fiveMins = 1; }, 300000);
setInterval(function(){ tenMins = 1; }, 600000);



navigatePlugin(bot);
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[70] = false; // avoid redstone
bot.navigate.blocksToAvoid[72] = false; // avoid redstone
bot.navigate.blocksToAvoid[55] = false; // avoid redstone
bot.navigate.blocksToAvoid[331] = false; // avoid redstone
//~ bot.navigate.blocksToAvoid[115] = true; // avoid netherwart
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops

bot.navigate.on('pathPartFound', function (path) {
  console.log("Going " + path.length + " meters in the general direction for now.");
});
bot.navigate.on('pathFound', function (path) {
  console.log("I can get there in " + path.length + " moves.");
});
bot.navigate.on('cannotFind', function (closestPath) {
  console.log("unable to find path. getting as close as possible");
  bot.navigate.walk(closestPath);
});
bot.navigate.on('arrived', function () {
  console.log("I have arrived");
});
bot.navigate.on('interrupted', function() {
  console.log("stopping");
});


bot.on("auctionStart", function( count, item, notUsed, rawMessage, matches ){
  //~ console.log(matches)
  //~ kgkkjvh
  console.log(">Auction start", "count:"+count, "item:"+item, "bidStart:"+matches[3], "inc:"+matches[4] )
  auction.doBid = 0
  auction.item = item
  auction.count = parseInt(count)
  auction.sec = 60
  auction.bidStart = parseInt(matches[3])
  auction.bid = 0
  auction.inc = parseInt(matches[4])
  bot.chat("/youcannotdothattwice")

  console.log(auction)


  if (auction.list[auction.item]){
    if ( auction.list[auction.item] > (auction.bidStart / auction.count) ){
      console.log("+Auction we are interested in! item: "+auction.item+" ("+(auction.bidStart / auction.count)+" per)");
      auction.doBid = 1;
    } else {
      console.log("-I'm interested in but don't want to pay so much for ! item: "+auction.item+" ("+(auction.bidStart / auction.count)+" per)");
    }

  }

}) // auctionStart
bot.on("auctionBid", function(bid){
  auction.bid = parseInt(bid)
  console.log(">Auction bid "+auction.bid)
  if (auction.doBid == 1){
    console.log(">Bid for '"+auction.item+"' raised to "+auction.bid+" ("+(auction.bid / auction.count)+" per)");
    if ( auction.list[auction.item] > ( (auction.bid + auction.inc) / auction.count) ){
      console.log("+  Item is  still cheap enough!");
    } else {
      console.log("-  Item has become too epensive");
      auction.doBid = 0;
    }
  }
})
bot.on("auctionWon", function(username, item, notUsed, rawMessage, matches ){
  console.log(">Auction won", username, item, matches[3])
  if (username == bot.username){
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++")
    console.log("+  I won "+item+" for "+matches[3]+" ("+(parseInt(matches[3]) / auction.count)+" per)!!");
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++")
  } else {
    console.log("!  "+username+" won the "+item+" for "+parseInt(matches[3])+" ("+(parseInt(matches[3]) / auction.count)+" per)");
  }

  auction.doBid = 0
  auction.item = "none"
  auction.count = 0
  auction.sec = 0
  auction.bidStart = 0
  auction.bid = 0
  auction.inc = 0
})
bot.on("auctionEnd", function(){
  auction.doBid = 0
  auction.item = "none"
  auction.count = 0
  auction.sec = 0
  auction.bidStart = 0
  auction.bid = 0
  auction.inc = 0
})
bot.on("auctionTime", function(sec){
  auction.sec = parseInt(sec)
  console.log(">Auction time "+auction.sec)
  if (auction.doBid == 1 && auction.sec == 1){
    if (!parseInt(auction.delay) || auction.delay < 500 || auction.delay > 990){auction.delay = 800; console.log("-reset bid delay to 800ms")}

    setTimeout(function(){
      if ( auction.doBid == 1 ){
        bot.chat("/bid")
        if (auction.bid == 0){
          console.log(">  Bid "+auction.bidStart+" on item!");
        } else {
          console.log(">  Bid "+(auction.bid+auction.inc)+" on item!");
        }
      }
    }, auction.delay)
  } else if (auction.sec > 4){ bot.chat("/norepeatingcommandssucks") }
});


bot.on("error", function(err){
  console.log("We got an err!")
  console.log(err)
  if (bot) {bot.quit()}
  process.exit()
});

bot.on("balance", function(bal){ bot.chat("/msg mcorgano I have "+bal) })

bot.on('spawn', function() {
  console.log("Bot has spawnned!")
  setTimeout( function() {

    console.log("Username == "+bot.username)

    //~ bot.chat("/home");
    //~ bot.equip(0, 'hand')
    bot.unequip()
    setTimeout( function() {
      if (process.argv.length > 5){


        if (process.argv[6] == "cobble"){
          bot.chat("/home");
          setTimeout(function() {
            emptyInv(Object([ '257', '270', '274', '278', '285' ]), function(){
              equipOneOf(Object([ '257', '270', '274', '278', '285' ]), 0, function(){
                target = bot.blockAt(bot.entity.position.offset(0, 1, 0));
                return dig()
              });
            });
          }, 1000)
        } else if (process.argv[6] == "tree"){
          emptyInv([ '275', '6' ], function(){
            equipOneOf([ '275' ], 0, function(){
              bot.chat("/is home")
              setTimeout(tree(), 1000)
            })
          });
        } else if ( (bot.username != "MCorBit" && bot.username != "skyhope712") || process.argv[6] == "nether") {
          tenMins = 1
          fiveMins = 1
          setTimeout(crops(), 1000)
        } else if (bot.username == "skyhope712" || process.argv[6] == "mine") {
          //~ var results = bot.navigate.findPathSync( vec3(-4421, 5, -2329) );
          //~ var results = bot.navigate.findPathSync( vec3(-4417, 5, -2332) );
          //~ bot.navigate.walk(results.path, function(stopReason) {
            //~ if (stopReason != "arrived") {
              //~ console.log("Cannot get back to orgin")
              //~ return
            //~ } else {
              //~ console.log("At origin")
              //~ mine()
            //~ }
          //~ }) // bot.walk
          //~ bot.equip(257)
          bot.chat("/home");
          setTimeout( function() {
            mine()
          }, 5200)
        } else if (process.argv[6] == "scan") {
          bot.quit()
        }


      }
    }, 3000)
  }, 1000)
});
bot.on('tpRequest', function(username) {
  if ( masters.indexOf(username) > -1 ) {
    bot.chat("/tpyes")
  }
});
bot.on('addRequest', function(username) {
  if ( masters.indexOf(username) > -1 ) {
    bot.chat("/island join")
    setTimeout( function(){
	bot.chat("/tpa "+username);
      setTimeout( function(){
        bot.chat("/sethome");
        dig()
      }, 8000);
    }, 1000);
  }
});
bot.on('chat', function(username, message) {
	//~ console.log(username + ":  " + message)
});
bot.on('whisper', function(username, message) {
  if(username === bot.username) {return;}
  var target = bot.entity;
  if (bot.players[username]){target = bot.players[username].entity;}
  //~ console.log("Whisper: "+message)
  switch(message) {
    case 'sweep':
      sweep(20, function(){  console.log("sweep finnished"); })
      break;
    case 'bal':
      bot.chat("/bal");
      break;
    case 'list':
      sayItems();
      break;
    case 'empty':
      emptyInv([]);
      break;
    case 'hand':
      console.log(bot.heldItem);
      break;
    case 'dig':
      dig();
      break;
    case 'mine':
      mine();
      break;
    case 'crops':
      crops();
      break;

    case 'tree':
      tree()
      break;
    case 'equip dirt':
      equipDirt();
      break;
    case 'come':
      bot.navigate.to(target.position);
      break;
    case 'stop':
      bot.navigate.stop();
      break;

    default:
      break;

  }

  if (message.substring(0, 3) == "say" && message.substring(4, 8) != "/pay") {
    bot.chat(message.substring(4));
  } else if (message.substring(0, 5) == "delay" && parseInt(message.substring(5)) ){
    auction.delay = parseInt(message.substring(5));
  } else {
    var match = message.match(/^goto\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s*$/);
    if (match) {
      var pt = vec3(
        parseFloat(match[1], 10),
        parseFloat(match[2], 10),
        parseFloat(match[3], 10));
      bot.navigate.to(pt);
    //~ } else {
      //~ console.log("no match");
    }
  }

});

function moveMiddle(goalPosition,done){
	bot.lookAt(goalPosition.offset(0,bot.entity.height,0),true);
	bot.setControlState('forward', true);
	var arrive=setInterval((function(goalPosition,done){return function()
	{
		if(Math.abs(goalPosition.x-bot.entity.position.x)+Math.abs(goalPosition.z-bot.entity.position.z)<0.12 )
		{
			bot.setControlState('forward', false);
			clearInterval(arrive);
			done();// maybe signal an error if the goal position isn't free (same thing for move to)
		} else bot.lookAt(goalPosition.offset(0,bot.entity.height,0),true);
	}})(goalPosition,done),50);
}
// Sweep - looks for any items the bot sees on the same level for it an picks them up
function sweep(range, callback, lastItem){
  if (!range || range < 0){range = 100}
  for (var key in bot.entities) {
    // If twice in a row the bot tries to pick up the same item, some error happened. Full inv is most common
    if (bot.entities[key] == lastItem){
      console.log("Failed to pick up item! am I full?")
      return callback("Inventory full (collected same item twice)")

    } else if ( bot.entities[key].metadata && bot.entities[key].metadata['10'] && bot.entity.position.distanceTo(bot.entities[key].position) < range && bot.entities[key].height == 0 && Math.abs(bot.entities[key].position.y - bot.entity.position.y) < 0.1 ){
      console.log("Found one!")
      console.log(bot.entities[key].position, bot.entities[key].metadata['10']);
      var results = bot.navigate.findPathSync(bot.entities[key].position);
      return bot.navigate.walk(results.path, function(stopReason) {
        if (stopReason == "obstructed"){
          console.log("!   Cannot get to location!");
          //~ bot.chat("/is home");
        }

        return setTimeout(function(){ sweep(range, callback, bot.entities[key]) },300)
      })
    }
  }

  callback()
}
function tree() {


  return sweep(35, function(){
    var results = bot.navigate.findPathSync( vec3(2187, 142, 3735) );
    return bot.navigate.walk(results.path, function(stopReason) {

      bot.lookAt(bot.entity.position.offset(-1, 1.5, 0), true, function(){
        emptyInv(['275','6'], function(){
          setTimeout( function() {

            equipOneOf('275', 0, function(){
              console.log("Looking for tree")
              var block = searchTree();
              if (!block){
                console.log("no trees found")

                return setTimeout( function(){tree()}, 1000)
              }

              return start(block)

            });

          }, 200)
        });
      });

    });
  });

  function start(block){
    if (!block){console.log("! mineTree called with invalid block!"); return;}
    //~ console.log(">Dig netherwart!")
    //~ var distance = Math.abs(block.position.x-bot.entity.position.x) + Math.abs(block.position.y-bot.entity.position.y) + Math.abs(block.position.z-bot.entity.position.z)
    //~ console.log(distance)
    //~ if (distance > 2.2) {

    console.log("  Walking to tree")
    //~ var location = block.position
    var results = bot.navigate.findPathSync(block.position);

    bot.navigate.walk(results.path, function(stopReason) {
      if (stopReason == "obstructed"){
        console.log("!   Cannot get to location!");
        //~ bot.chat("/is home");
        return
        //~ return setTimeout(function(){ crops() },300)
      }
      return setTimeout(function(){
        console.log("    done walking. " + stopReason);

        // 275 stone axe

        var target1 = block
        var target2 = bot.blockAt(block.position.offset(0, 1, 0))
        var target3 = bot.blockAt(block.position.offset(0, 2, 0))

        console.log("  Equipping axe")
        equipOneOf([275], 0, function(err){
          if (err){
            console.log("Error equipping pic!")
            return
          }
          console.log("    Mining tree")
          bot.dig(target1, function(){
            console.log("      Done mining 1")
            bot.dig(target2, function(){
              console.log("      Done mining 2")
              bot.dig(target3, function(){
                console.log("      Done mining 3")

                var results = bot.navigate.findPathSync(block.position);
                console.log("        Moving to spiral position")
                bot.navigate.walk(results.path, function(stopReason) {
                  if (stopReason == "obstructed"){
                    console.log("!   Cannot get to location! PErhaps mining tree failed?");
                    //~ bot.chat("/is home");
                    return
                    //~ return setTimeout(function(){ crops() },300)
                  }

                  return setTimeout(function(){ spiral(block, 0) }, 200)

                })

              }) // dig 3
            }) // dig 2
          }) // dig 1
        }) // equipt
      }, 100)

        //~ digNether(block)
    });
  }

  function spiral(block, num){
    console.log("  spiral "+num)
    var nextnum = 0, step
    var x = 0
    var z = 0
    if (num == 0){nextnum = 1, x = 1, z = 0}
    if (num == 1){nextnum = 2, x = 0, z = 1}
    if (num == 2){nextnum = 3, x = -1, z = 0}
    if (num == 3){nextnum = 0, x = 0, z = -1}

    step = bot.blockAt(block.position.offset(x, 0, z))
    if (step.type == 0){
      console.log("need to place step!")
      var face = mineflayer.vec3(-1, 0, 0)
      target1 = bot.blockAt(block.position.offset(1, 0, 0))
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(0, 0, 1)); face = mineflayer.vec3(0, 0, -1) }
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(-1, 0, 0)); face = mineflayer.vec3(1, 0, 0) }
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(0, 0, -1)); face = mineflayer.vec3(0, 0, 1) }
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(0, 1, 0)); face = mineflayer.vec3(0, -1, 0) }

      return equipOneOf(['17','162','163'], 0, function(){
        bot.placeBlock(target1, face, function(){

          spiral(block, num);

        })
      })

    }


    var target1 = bot.blockAt(block.position.offset(x, 1, z))
    var target2 = bot.blockAt(target1.position.offset(0, 1, 0))
    var target3 = bot.blockAt(target1.position.offset(0, 2, 0))
    var check1 = bot.blockAt(target1.position.offset(0, 3, 0))
    var check2 = bot.blockAt(bot.entity.position.offset(0, 3, 0))
    //~ console.log("Next bottom block to mine")
    //~ console.log(target1.position)

    if ((!target1 || target1.type == 0)&&(!target2 || target2.type == 0)&&(!check1 || check1.type == 0)&&(!check2 || check2.type == 0)){

      if (num == 0){x = 1, z = 1}
      if (num == 1){x = 0, z = 1}
      if (num == 2){x = 0, z = 0}
      if (num == 3){x = 1, z = 0}
      location = bot.blockAt(block.position.offset(x, 10, z)).position

      var results = bot.navigate.findPathSync(target1.position);
      console.log("        Moving to top middle")
      bot.navigate.walk(results.path, function(stopReason) {
        console.log(target1.position.y)
        console.log(bot.entity.position.y)
        if (stopReason == "obstructed"){
          console.log("Moving failed, trying again")
          return spiral(block, num);
        }

        var target = ""
        for (x = -1; x < 2; x++){
          for (y =  0; y < 2; y++){
            for (z = -1; z < 2; z++){
              target = bot.blockAt( bot.entity.position.offset(x, y, z) )
              if ( target && (target.type == 17 || target.type == 18 || target.type == 161 || target.type == 162) ) {
                console.log("    Block might be in the way of middle func, digging")
                return bot.dig(target, function(){ spiral(block, num) })
              }
            }
          }
        }


        setTimeout(function(){
          location = vec3(location.x, bot.entity.position.y, location.z)
          moveMiddle(location, function(){
            console.log("At middle!")
            console.log(bot.entity.position)
            //~ return
            return setTimeout(function(){digDown(location)}, 1000)
          }); // movemiddle
        }, 200)
      })


      //~ })
      return
    }

    console.log("  Equipping axe")
    equipOneOf([275], 0, function(){
      console.log("    Mining tree")
      bot.dig(target1, function(){
        //~ console.log("      Done mining 1")
        bot.dig(target2, function(){
          //~ console.log("      Done mining 2")
          bot.dig(target3, function(){
            //~ console.log("      Done mining 3")

            var results = bot.navigate.findPathSync(target1.position);
            console.log("        Moving up to next step")
            bot.navigate.walk(results.path, function(stopReason) {
              if (stopReason == "obstructed"){
                console.log("Moving failed, trying again")
                return spiral(block, num);
              }

              return setTimeout(function(){ spiral(target1, nextnum) }, 200)

            })

          })
        })
      })
    })


  }

  function digDown(location, tryNum){
    if (!tryNum){tryNum=0}
    console.log("Dig down "+tryNum)
    //~ console.log(location)
    //~ console.log(vec3( location.x, bot.entity.position.y -1, location.z))
    var target = ""

    for (x = -3; x < 3; x++){
      for (z = -3; z < 3; z++){
        if ( !target || (target.type != 17 && target.type != 162) ) {target = bot.blockAt( vec3( location.x+x, bot.entity.position.y+1, location.z+z) ); }
      }
    }

    if ( !target || (target.type != 17 && target.type != 162) ) {target = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z) ); }
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {target = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z-1) ); console.log(target.type+"   "+target.position)}
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {target = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z-1) ); console.log(target.type+"   "+target.position)}
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {target = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z) ); console.log(target.type+"   "+target.position)}
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {
      if (tryNum > 5){
        console.log("No more logs to dig"); return replant(location)
      } else {
        console.log("No logs found, waiting")
        tryNum = tryNum + 1
        return setTimeout(function(){digDown(location, tryNum)}, 100*tryNum)
      }
    }

    if (!target) {
      console.log("  Target block invalid?")
      console.log(target)
      return setTimeout(function(){digDown(location)}, 100)
    }

    if ( !bot.heldItem || bot.heldItem.type != 275){
      console.log("  Equipping axe")
      equipOneOf([275], 0, function(){digDown(location)})
    }

    if(target && bot.canDigBlock(target)) {
      //~ console.log("  starting to dig " + target.name);
      return bot.dig(target, function(){  digDown(location)  });
    } else {
      console.log("    cannot dig");
    }
  }

  function replant(location){

    //~ console.log(bot.entities)
    //~ console.log("Collect sapplings before replanting")
    //~ return sweep(35, function(){

    return sweep(35, function(){
      setTimeout( function() {

        var results = bot.navigate.findPathSync( vec3( location.x, bot.entity.position.y -1, location.z) );
        return bot.navigate.walk(results.path, function(stopReason) {

          var target1 = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z) );
          var target2 = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z) );
          var target3 = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z-1) );
          var target4 = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z-1) );
          //~ bot.equip(bot.inventory.findInventoryItem( 6, 1), "hand", function(err) {
          //~ bot.equip(bot.inventory.findInventoryItem( 6, 5), "hand", function(err) {
          bot.equip(6, "hand", function(err) {
          bot.equip(6, "hand", function(err) {

            bot.placeBlock(target1, mineflayer.vec3(0, 1, 0), function(){
            bot.placeBlock(target2, mineflayer.vec3(0, 1, 0), function(){
            bot.placeBlock(target3, mineflayer.vec3(0, 1, 0), function(){
            bot.placeBlock(target4, mineflayer.vec3(0, 1, 0), function(){
              console.log("done placing sapplings");

              return sweep(35, function(){
                var results = bot.navigate.findPathSync( vec3(2187, 142, 3735) );
                return bot.navigate.walk(results.path, function(stopReason) {

                  bot.lookAt(bot.entity.position.offset(-1, 1.5, 0), true, function(){
                    emptyInv(['275','6'], function(){
                      setTimeout( function() {
                        equipOneOf('275', 0, function(){
                          return setTimeout( tree(), 1000)
                        });
                      }, 200)
                    });
                  });

                });
              });

            });
            });
            });
            });

          });
          });

        });

      }, 200)
    });

  }
}


function mine(origin, xInit, xModInit){
  var mineList = [1,2,3,4,12,13,24,    14,15,16,21,56,73,74,129]
  var oreList = [14,15,16,21,56,73,74,129]
  var avoidList = [8,9,10,11]

  if (!origin){origin = vec3(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z)}
  console.log(origin)

  //~ feet = bot.blockAt( bot.entity.position.offset(0, 0, 0) )
  //~ return mineOres(feet, function(){console.log("done mineOres")})

  for (xMod = -1; xMod < 2; xMod += 2){
    //~ if (xMod == -1 && xModInit){console.log("Setting tunnel xMod to "+xModInit); xMod = xModInit}

    for (x = 1; x <= 120; x++){
      //~ if (x == 1 && xInit){console.log("Setting tunnel x to "+(xInit*xMod)); x = xInit*xMod}

      zp = bot.blockAt( origin.offset(x*xMod, 0, 1) )
      feet = bot.blockAt( origin.offset(x*xMod, 0, 0) )
      zm = bot.blockAt( origin.offset(x*xMod, 0, -1) )
      //~ console.log(mineList.indexOf(head.type) == -1 , mineList.indexOf(feet.type) == -1 , avoidList.indexOf(below.type) == -1)
      //~ console.log(feet.name,isClear( feet ))
      if (  isClear( feet ) && (zp.type != 50 || zm.type != 50)  ){
        //~ console.log("Tunnel is clear at ", feet.position, x%4 )
        if (x%4 == 0){
          console.log("Clear path to branch "+(x/4*xMod))
          var results = bot.navigate.findPathSync( bot.blockAt(origin.offset(x*xMod, 0, 0)).position );
          return bot.navigate.walk(results.path, function(stopReason) {
            if (stopReason != "arrived") {
              console.log("Cannot get to branch")
              return
            } else {
              return selectBranch()
            }
          }) // bot.walk
        }
      } else if (!isClear(feet)){
        break
      }
    }
    console.log("Tunnel ends at ", feet.position)
  }

  console.log("Out of tunnels to mine!")
  var results = bot.navigate.findPathSync( origin );
  return bot.navigate.walk(results.path, function(stopReason) {
    if (stopReason != "arrived") {
      console.log("!    walking failed!")
      return
    } else {

    }
  }) // bot.walk


  function selectBranch(){
    if (bot.blockAt( bot.entity.position.offset(0, 0, 0) ).type != 50){
      placeTorch(selectBranch)
    }
    for (zMod = -1; zMod < 2; zMod += 2){
      console.log(    bot.blockAt( bot.entity.position.offset(0, 1, zMod) ).type, bot.blockAt( bot.entity.position.offset(0, 0, zMod) ).type    )
      if (bot.blockAt( bot.entity.position.offset(0, 1, zMod) ).type == 50 || bot.blockAt( bot.entity.position.offset(0, 0, zMod) ).type == 50){
        console.log("-  Branch "+(x/4)+" z "+zMod+" is marked, assuming complete")
      } else {
        console.log("+  Starting branch "+(x/4)+" z "+zMod)
        return tunnel(zMod)
      }
    }

    console.log("!  both branches marked!")
    if (bot.entity.position.x < origin.x){
      return mine(origin, 0-(bot.entity.position.x-origin.x), -1)
    } else {
      return mine(origin, 0+(bot.entity.position.x-origin.x), 1)
    }
  }
  function placeTorch(callback, tryNum){
    if (!tryNum){tryNum = 0}
    console.log(">Placing torch")
    setTimeout(function(){
      return bot.equip(50, 'hand', function(err){
        if (err == "Error: Server rejected transaction."){
          console.log("    Error equipting torches, re-try in .2 seconds")
          return setTimeout( function(){ placeTorch(callback, tryNum+1) }, 200)
        } else if(err){
          console.log("    could not equipt item!")
          if (tryNum < 3){return setTimeout( function(){ placeTorch(callback, tryNum+1) }, 200)}
          return setTimeout(function(){

            console.log("do something when out of torches")
            return
          }, 1000)
        }
        return bot.placeBlock(  bot.blockAt( bot.entity.position.offset(0, -1, 0)), mineflayer.vec3(0, 1, 0), function(){
          callback()
        })
      })
    }, 200)
  }

  function tunnel(zMod, tryNum){
    if (!tryNum){tryNum=1}
    if (Math.abs(origin.z-bot.entity.position.z) >= 160){
      console.log("Completed branch!")
      if (bot.blockAt( bot.entity.position.offset(0, 0, 0) ).type != 50){
        return placeTorch(function(){tunnel(zMod)})
      }

      return walkBack(zMod)
    }

    if (Math.round(bot.entity.position.z - origin.z)%8 == 0 && bot.blockAt( bot.entity.position.offset(0, 0, 0) ).type != 50){
      return placeTorch(function(){tunnel(zMod)})
    }

    head  = bot.blockAt( bot.entity.position.offset(0, 1, zMod) )
    feet  = bot.blockAt( bot.entity.position.offset(0, 0, zMod) )
    below = bot.blockAt( bot.entity.position.offset(0,-1, zMod) )
    //~ console.log(">Checking blocks at "+feet.position.x+"  "+feet.position.z+"    "+Math.round(bot.entity.position.z - origin.z)%8)

    var target, word = ""

    if (mineList.indexOf(feet.type) != -1){
      //~ console.log("  feet type is mineable")
      if (isBeside(feet, [8,9,10,11]) == false) {
        word = "feet"
        target = feet
      } else {
        console.log("-  isBehind triggered! tunnel impassible")
        return walkBack(zMod)
      }
    }
    if (mineList.indexOf(head.type) != -1){
      //~ console.log("  Head type is mineable")
      if (isBeside(head, [8,9,10,11]) == false) {
        word = "head"
        target = head
      } else {
        console.log("-  isBehind triggered! tunnel impassible")
        return walkBack(zMod)
      }
    }

    if (word != ""){
      console.log("> Mine "+word+" block!")
      //~ console.log(target)
      //~ console.log(bot.heldItem)
      return equipAndDig(target, tunnel, walkBack, zMod)
      console.log(">inventory items: "+bot.inventory.items().length)
    }

    if (isClear(feet)){
      return mineOres(feet, function(){
        //~ console.log("+  clear! walking!")
        var results = bot.navigate.findPathSync( feet.position );
        return bot.navigate.walk(results.path, function(stopReason) {
          if (stopReason != "arrived") {
            console.log("!    walking failed!")
            return
          } else {
            return tunnel(zMod)
          }
        }) // bot.walk
      })

    }

    if (word = ""){
      console.log("!    Neither block mineable and path blocked, returning")
      return walkBack(zMod)
    }

    console.log("!  tunnel ended with nothing happening",tryNum)
    walkBack(zMod)
  }

  function equipAndDig(target, callback, failcallback, zMod, tryNum){
    if (!tryNum){tryNum=1}
    console.log("target type", target.type)
    if (target.harvestTools && target.type != 3 && target.type != 12 && target.type != 13){
      if ( !bot.heldItem || !target.harvestTools[bot.heldItem.type] || target.harvestTools[bot.heldItem.type] != true){
        console.log("-  Equip pick first")
        return equipOneOf(  Object.keys(target.harvestTools), 0, function(){
          setTimeout(function(){return callback(zMod)}, 200)
        })
      }
      //~ } else { console.log("   Already holding tool") }
    } else if(bot.heldItem){
      console.log("-  Equip nothing")
			return setTimeout(function(){
				return bot.unequip(null, function(){
          console.log("now holding ", bot.heldItem)
          return setTimeout(function(){console.log("now try to dig");return equipAndDig(target, callback, failcallback, zMod, tryNum)}, 250)
        })
      }, 200)
		}

    if(target && bot.canDigBlock(target)) {
      console.log("  starting to dig " + target.name);
      return bot.dig(target, function(err){
        return setTimeout(function(){
          if (!err){
            var newBlock = bot.blockAt( target.position)
            if (newBlock.type != target.type){
              console.log("    Mined "+target.name)
              return callback(zMod)
            } else {
              console.log("    Mineing failed?")
              bot.unequip()
              return setTimeout(function(){ equipAndDig(target, callback, failcallback, zMod, tryNum) },200)
            }
          } else {
            console.log("!  error ", err.code)
            if (tryNum > 4){console.log("!    Tried digging too many times!"); return failcallback(zMod)}
            return setTimeout(function(){ equipAndDig(target, callback, failcallback, zMod, tryNum) },200)
          }
        },200)
      });
    } else {
      console.log("    cannot dig for some reason (!block?)");
    }

  }

  function mineOres(feet, callback, initX, initY, miny, maxy){
    if (!miny){miny = 0}
    if (!maxy){maxy = 5}
    for (xMod = -1; xMod < 3; xMod += 2){
      for (x = 0; x < 3; x++){
        if (x == 0 && initX){x = initX}
        if (x > 0 || xMod == -1){
          for (y = maxy; y >= miny; y=y-1){
            if (y == maxy && initY){y = initY}

            //~ console.log(x*xMod, y)

            block = bot.blockAt(feet.position.offset(x*xMod, y, 0))
            if (oreList.indexOf(block.type) != -1){
              if (!isBeside(block, avoidList)){
                console.log("  Found "+block.name+" to mine!")



                // handle block being to the SIDE of the bot
                if (x > 1){
                  console.log("  Need to dig to the side")
                  for (x2 = 1; x2 < x; x2=x2+1){
                    for (y2 = 0; y2 < 2; y2=y2+1){
                      blockBesideOre = bot.blockAt(feet.position.offset(x2*xMod, y2, 0))
                      if (blockBesideOre && blockBesideOre.type != 0 && avoidList.indexOf(blockBesideOre.type) == -1 && !isBeside(blockBesideOre, avoidList)){
                        // Anti-op bit
                        //~ if (oreList.indexOf(blockBesideOre.type) == -1 && (block.position.y - blockBesideOre.position.y)^2 > 1){
                          //~ console.log("!   target block has too many blocks in the way")
                          //~ return mineOres(feet, callback, x, y-1, miny, maxy)
                        //~ }

                        console.log("    Mining "+blockBesideOre.name+" ("+block.pisition+") beside target "+block.name)
                        var results = bot.navigate.findPathSync( vec3(blockBesideOre.position.x, feet.position.y, blockBesideOre.position.z) );
                        return bot.navigate.walk(results.path, function(stopReason) {
                          equipAndDig(blockBesideOre, function(){mineOres(feet, callback, x, y, miny, maxy)}, function(){console.log("error mining "+blok.name)}, 1)
                          //~ bot.dig(block, function(){mineOres(feet, callback, initX, initY, miny, maxy)})
                        }) // bot.walk
                      }
                    }
                  }
                }

                // handle block being ABOVE the bot
                if (y > 1){
                  for (y2 = 0; y2 < y; y2=y2+1){
                    blockUnderOre = bot.blockAt(feet.position.offset(x*xMod, y2, 0))
                    if (blockUnderOre && blockUnderOre.type != 0 && avoidList.indexOf(blockUnderOre.type) == -1 && !isBeside(blockUnderOre, avoidList)){
                      // Anti-op bit
                      //~ if (oreList.indexOf(blockUnderOre.type) == -1 && (block.position.y - blockUnderOre.position.y)^2 > 1){
                        //~ console.log("!   target block has too many blocks in the way")
                        //~ return mineOres(feet, callback, x, y-1, miny, maxy)
                      //~ }

                      console.log("+    Mining "+blockUnderOre.name+" ("+block.pisition+") under target "+block.name)
                      if (bot.entity.position.distanceTo(vec3(blockUnderOre.position.x, feet.position.y, blockUnderOre.position.z)) > 2){
                        var results = bot.navigate.findPathSync( vec3(blockUnderOre.position.x, feet.position.y, blockUnderOre.position.z) );
                        return bot.navigate.walk(results.path, function(stopReason) {
                          equipAndDig(blockUnderOre, function(){mineOres(feet, callback, x, y, miny, maxy)}, function(){console.log("error mining "+blok.name)}, 1)
                          //~ bot.dig(block, function(){mineOres(feet, callback, initX, initY, miny, maxy)})
                        }) // bot.walk
                      } else {
                        return equipAndDig(blockUnderOre, function(){mineOres(feet, callback, x, y, miny, maxy)}, function(){console.log("error mining "+blok.name)}, 1)
                      }
                    }
                  }
                }

                console.log("  Mining target "+block.name, block.position)
                var results = bot.navigate.findPathSync( vec3(block.position.x, feet.position.y, block.position.z) );
                return bot.navigate.walk(results.path, function(stopReason) {
                  equipAndDig(block, function(){
                    return setTimeout(function(){ mineOres(feet, callback, x, y, miny, maxy) }, 200)
                  }, function(){
                    console.log("error mining "+blok.name)
                    return mineOres(feet, callback, x, y, miny, maxy)
                  }, 1)
                  //~ bot.dig(block, function(){mineOres(feet, callback, initX, initY, miny, maxy)})
                }) // bot.walk

              } else {
                console.log("-  Found "+block.name+" but is unsafe ", x*xMod, y)
              }
            }



          }
        } // if to prevent center being done twice
      }
    }

    var results = bot.navigate.findPathSync( feet.position );
    setTimeout(function(){
      return bot.navigate.walk(results.path, function(stopReason) {
        return callback()
      }) // bot.walk
    }, 400)

  }


  function walkBack(zMod){
    console.log("walking to hall at "+vec3(bot.entity.position.x, origin.y, origin.z+zMod))
    var results = bot.navigate.findPathSync( vec3(bot.entity.position.x, origin.y, origin.z+zMod) );
    return bot.navigate.walk(results.path, function(stopReason) {
      if (stopReason != "arrived") {
        console.log("!  Cannot get back to tunnel start")
        return
      } else {
        if (bot.entity.position.distanceTo(vec3(bot.entity.position.x, origin.y, origin.z+zMod)) < 2){
          console.log("  Done walking")
          return placeTorch(function(){
            setTimeout(function(){
              var results = bot.navigate.findPathSync( vec3(bot.entity.position.x, origin.y, origin.z) );
              return bot.navigate.walk(results.path, function(stopReason) {
                if (stopReason != "arrived") {
                  console.log("!  Cannot get back to isle")
                  return
                } else {
                  setTimeout(function(){
                    console.log("  Done walking")
                    selectBranch()
                  }, 500)
                }
              })
            }, 300) // settimeout
          }) // place torch
        } else {
          console.log("-  Finnished walking but not there yet")
          return walkBack(zMod)
        }
      }
    }) // bot.walk


  }

  function isClear(block){
    head = bot.blockAt( block.position.offset(0, 1, 0) )
    below = bot.blockAt( block.position.offset(0, -1, 0) )
    if (mineList.indexOf(head.type) == -1 && mineList.indexOf(block.type) == -1 && avoidList.indexOf(below.type) == -1){
      return true
    }
    return false
  }

  function isBeside(block, list){
    xp = bot.blockAt( block.position.offset(1, 0, 0) )
    xm = bot.blockAt( block.position.offset(-1, 0, 0) )
    yp = bot.blockAt( block.position.offset(0, 1, 0) )
    ym = bot.blockAt( block.position.offset(0, -1, 0) )
    zp = bot.blockAt( block.position.offset(0, 0, 1) )
    zm = bot.blockAt( block.position.offset(0, 0, -1) )
    if (list.indexOf(xp.type) != -1 || list.indexOf(xm.type) != -1 || list.indexOf(yp.type) != -1 || list.indexOf(ym.type) != -1 || list.indexOf(zp.type) != -1 || list.indexOf(zm.type) != -1){
      return true
    }
    return false
  }

}

//Tries to equipt an item from an array
function equipOneOf(list, num, callback, attempt) {
  if (!attempt){attempt=0}
  if (num == 0){
    console.log("Equipting item from list:")
    console.log(list)
	//~ console.log(bot.inventory.items())
  } else if (attempt && attempt > 5) {
    num ++
    attempt = 0
  }

  //~ console.log(bot.heldItem)
  if (bot.heldItem && list.indexOf(bot.heldItem.type) > -1){console.log("Already holding "+bot.heldItem.type); return callback() }

  //~ console.log(" trying to equipt item "+parseInt(list[num]))
  bot.equip(parseInt(list[num]), 'hand', function(err) {
    if(err) {
      //~ console.log(parseInt(list[num])+"  "+err)
      if (err == "Error: Server rejected transaction."){
        console.log("    Error equipting "+parseInt(list[num])+", re-try in 0.200 seconds")
        return setTimeout( function(){ equipOneOf(list, num, callback, attempt+1) }, 200)
      } else if (list.length > num+1) {
        equipOneOf(list, num+1, callback)
      } else {
        console.log("    Finnished Equipt list before finding item")
        return setTimeout(callback, 10000)
      }

    } else {
      console.log("    equipped item "+list[num]);
      callback()
    }
  });
}


function crops() {
  //~ console.log("pumpkin fired");
  //~ console.log("pumpkin fired");
  var block, block2, y=0


  return sweep( 10, function(){

    if (tenMins == 0){
      // search for grown netherwart
      //~ block = searchLane([115], null, null, [3], null, null, 0)
      block = searchDiamond([115], null, null, [3], null, null, 0)
      if (block){
        return equiptAxe(block)
      }
      // search for empty soulsand
      //~ block = searchLane([0], null, [88], null, null, null, 0)
      block = searchDiamond([0], null, [88], null, null, null, 0)
      if (block){
        return digNether(block)
      }

      console.log("-No crops were found.")
    } else {
      console.log(">====================================")
      console.log("+  Checkpoint! Toss crops")
      console.log(">====================================")
      tenMins = 0
    }
    if (  (Math.abs(2201+0.5-bot.entity.position.x) + Math.abs(3748+0.5-bot.entity.position.z)) > 1.5){ console.log(">TP home"); bot.chat("/is home") }
    setTimeout(function(){

    //~ var results = bot.navigate.findPathSync( vec3(2201, 142, 3748) );
    //~ return bot.navigate.walk(results.path, function(stopReason) {
      //~ console.log(stopReason)
      //~ if (stopReason){ setTimeout(crops(), 1000) }
    //~ });
      bot.lookAt(bot.entity.position.offset(2, 1, 0), true, function(){
        emptyInv(["-372","-372","279"], function(){
          console.log("> empty done, sweeping")
          return sweep( 50, function(){
            console.log(">   sweep done, restart")
            setTimeout(function(){  crops()  }, 2000)
          }) // sweep
        }); // emptyinv
      }); // lookat
    }, 300);
  });

  if (1==2){
  //~ console.log( bot.entity.position)
  //~ console.log(home)
  //~ console.log(bot.entity.position.x != home.x)
  //~ console.log(bot.entity.position.y != home.y)
  //~ console.log(bot.entity.position.z != home.z)
  //~ if ( bot.entity.position.x != home.x || bot.entity.position.y != home.y || bot.entity.position.z != home.z ){
    //~ console.log(">teleporting home");
    //~ bot.chat('/is home')
    //~ setTimeout(function(){
      //~ return bot.lookAt(bot.entity.position.offset(-2, 2, 0), true, function(){
        //~ emptyInv(["-372"], function(){
          //~ setTimeout(function(){
            //~ return
            //~ pumpkin()
            //~ return
          //~ }, 5000);
          //~ return
        //~ })
      //~ })
    //~ }, 1000)
  //~ } else { // fires when already at /is home, as defined by where /is home was the first time it was called after spawnning.
    //~ setTimeout(function(){
      //~ pumpkin()
    //~ }, 5000);
  //~ }
  }
  return

  function digMellon(block) {
    var location = vec3(
        parseFloat(block.position.x, 10),
        parseFloat(block.position.y, 10),
        parseFloat(block.position.z, 10) );
    var results = bot.navigate.findPathSync(location);
    console.log("status: " + results.status);
    bot.navigate.walk(results.path, function(stopReason) {
      //~ console.log("done walking. " + stopReason);
      if (stopReason != "arrived") {
        console.log("Error going to pumpkin: '"+stopReason+"'")
        pumpkin()
        return 6
      } else if(block && bot.canDigBlock(block)) {
        console.log("  starting to dig " + block.name);
        bot.dig(block, onDiggingCompleted);
      } else {
        console.log("    cannot dig");
      }

    });

  }


  function equiptAxe(block, trynum) {
    if (!trynum) {trynum = 0} // used for limiting how long it waits to pick up netherwart
    if (trynum >= 2) {console.log("!    no fortuine axe in inv!"); return digNether(block) }

    console.log("  switching to diamond axe")
    if (!bot.heldItem || bot.heldItem.type != 279) {
      bot.equip(279, 'hand', function(err){
        if(err) {

          if(err.message == "Invalid item object in equip") {
            console.log("  fortuine axe was not found in inventory. Trying again")
            return setTimeout(function(){  equiptAxe(block, trynum + 1)  }, 400)
          } else {
            console.log("!    unable to equip diamond axe: " + err.message);
            return setTimeout(function(){  equiptAxe(block, trynum + 1)  }, 400)
          }
        } else {
          console.log("+    Equipped diamond (fortuine) axe sccessfully")
          return setTimeout(function(){digNether(block);}, 400);
        }
      })
    } else { //
      console.log("+    Diamond axe equipped already!")
      return setTimeout(function(){digNether(block);}, 400);
    }
  }

  function digNether(block) {
    if (!block){console.log("! digNether called with invalid block!"); return; return crops()}
    console.log(">Dig netherwart!")
    var distance = Math.abs(block.position.x-bot.entity.position.x) + Math.abs(block.position.y-bot.entity.position.y) + Math.abs(block.position.z-bot.entity.position.z)

    if (distance > 2.2) {
      //~ console.log("  Walking to block ("+distance+")")

      var location = vec3(block.position.x, block.position.y, block.position.z)
      var results = bot.navigate.findPathSync(location);
      bot.navigate.walk(results.path, function(stopReason) {
        if (stopReason == "obstructed"){
          console.log("!   Cannot get to location!");
          bot.chat("/is home");
          return setTimeout(function(){ crops() },500)
        }
        console.log("    done walking to netherwart. " + stopReason);
        return digNether(block)
      });

    } else {
      //~ console.log("  At block location, digging block")
      if(block && bot.canDigBlock(block)) {
        console.log("    starting to dig Netherwart");
        bot.dig(block, function(err){
          if(err) {
            //~ bot.chat("/tell MCorgano unable to dig netherwart: " + err.message);
            console.log("!   Error digging netherwart: " + err.message);
            //~ return crops()
            return
          } else {
            console.log("+   Netherwart dug successfully!")

            return setTimeout(function(){  equiptNether(block)  }, 200);
          }
        });

      } else if(block && block.type == 0) {
        console.log("    Netherwart already mined!")
        return setTimeout(function(){  equiptNether(block)  }, 300);
      } else { // if block && bot.canDigBlock(block) is false
        console.log(block)
        console.log("!   Block error while trying to mine netherwart!")
        return crops()
      }
    }
  } // sub-function digNether

  function equiptNether(block, trynum) {
    if (!trynum) {trynum = 0} // used for limiting how long it waits to pick up netherwart
    if (trynum > 10) {console.log("!    no netherwart in inv!"); return crops() }

    return sweep(5, function(){
      console.log("> switching to netherwart")
      if (!bot.heldItem || bot.heldItem.type != 372) {
        bot.equip(372, 'hand', function(err){
          if(err) {

            if(err.message == "Invalid item object in equip") {
              console.log("-  Netherwart not found in inventory. Waiting a bit to pick it up and trying again")
              return setTimeout(function(){  equiptNether(block, trynum + 1)  }, 400)
            } else {
              console.log("!    unable to equip netherwart: " + err.message);
              return setTimeout(function(){  equiptNether(block, trynum + 1)  }, 400)
              return crops()
            }
          } else {
            console.log("+  Equipped netherwart sccessfully")
            //~ return
            return setTimeout(function(){replantNether(block);}, 300);
          }
        })
      } else { //
        console.log("+  Netherwart equipped already!")
        //~ return
        return setTimeout(function(){replantNether(block);}, 300);
      }
    }) // SWEEP
  }

  function replantNether(block, trynum) {
    var newBlock = bot.blockAt( mineflayer.vec3(block.position.x ,block.position.y ,block.position.z))
    //~ console.log("  Before planting block ID: "+newBlock.type)
    if (newBlock.type == 115) {console.log("    Block is already netherwart!"); return crops() }
    if (!trynum) {trynum = 0} // used for limiting how long it waits to pick up netherwart
    if (trynum > 10) {console.log("!    placing netherwart keeps failing!"); return crops() }


    console.log(">  planting netherwart")
    var location = block.position.offset(0,-1,0);
    var reference = bot.blockAt( location )

    bot.lookAt( block.position, true, function(){
      console.log("    + Lookat Success")
      setTimeout(function(){
      console.log("    + timeout done, ref:   "+reference.position)
        return bot.placeBlock(reference, mineflayer.vec3(0, 1, 0), function(){
          console.log("   placed block")
          return setTimeout(function(){
            var newBlock = bot.blockAt( mineflayer.vec3(block.position.x ,block.position.y ,block.position.z))
            //~ console.log("  New block ID: "+newBlock.type)
            if (newBlock.type != 115) {
              return setTimeout(function(){
                var newBlock = bot.blockAt( mineflayer.vec3(block.position.x ,block.position.y ,block.position.z))
                //~ console.log("  New block ID: "+newBlock.type)
                if (newBlock.type != 115) {
                  console.log("-    Placeing netherwart failed, trying again...")
                  //~ return
                  return setTimeout( function(){  replantNether(block, trynum+1)  }, trynum*100);
                } else {
                  console.log("+    planting succeeded! (second check)")
                  //~ return
                  return crops()
                }
              }, 300)

            } else {
              console.log("+    planting succeeded!")
              //~ return
              return crops()
            }
          }, 200)
        }) // block.place
      }, 200)
    }); // bot.lookat
  }



  function onDiggingCompleted() {
    console.log("    finished digging " + block.name);
    setTimeout(function(){return; console.log("    restarting"); console.log(crops())}, 300)
  }
}


// Search pattern that looks around in a diamond shape
// type, typeAbove, and typeBelow are arrays containing ints of the block.type to find
// meta, metaAbove, and metaBelow are arrays containing ints of the block.metadata to find
// orientation can be [0 or null] or [1 or greater] to switch the direction of the lanes
//    0: rows going -x to +x
//    1: rows going -z to +z
// If the bot jumps between rows instead of going stright down one row, try changing the orientation :P
// The function searches blocks at the bots location, being where the bot's legs are as the center.
// returns the block found on the same height as the bot's legs, regaurdless of wether typeabove or typebelow are given.
function searchTree() {
  var type = [17, 162]

  var y = 0

  for (dist = 0; dist < 20; dist = dist+1) {      // controls how many blocks out the diamond shape is
    for (x = -dist; x < dist+1; x = x+1) {        // go across the diamond shape, one corner to the other
      for (modz = -1; modz < 2; modz = modz +2) { // switch from top to bottom side of diamond shape
        //~ if (x == 0 && modz == 1){break}

        block1  = bot.blockAt(  bot.entity.position.offset( 0+x, y, 0+modz*(dist-Math.abs(x)) )  )
        block2  = bot.blockAt(  bot.entity.position.offset( 1+x, y, 0+modz*(dist-Math.abs(x)) )  )
        block3  = bot.blockAt(  bot.entity.position.offset( 1+x, y, 1+modz*(dist-Math.abs(x)) )  )
        block4  = bot.blockAt(  bot.entity.position.offset( 0+x, y, 1+modz*(dist-Math.abs(x)) )  )
        //~ console.log(modx*x+", "+y+", "+modz*z+"    "+block.type)

        if (block1 && block2 && block3 && block4 && type.indexOf(block1.type) > -1 && type.indexOf(block2.type) > -1 && type.indexOf(block3.type) > -1 && type.indexOf(block4.type) > -1){
          console.log("+    Found!   Block1: "+block1.type+":"+block1.metadata+"   Block3: "+block3.type+":"+block3.metadata)
          return block1
        }

      } // for modZ
    } // for x
  } // dist
  return null
} // searchTree


// Search pattern that looks around in a diamond shape
// type, typeAbove, and typeBelow are arrays containing ints of the block.type to find
// meta, metaAbove, and metaBelow are arrays containing ints of the block.metadata to find
// orientation can be [0 or null] or [1 or greater] to switch the direction of the lanes
//    0: rows going -x to +x
//    1: rows going -z to +z
// If the bot jumps between rows instead of going stright down one row, try changing the orientation :P
// The function searches blocks at the bots location, being where the bot's legs are as the center.
// returns the block found on the same height as the bot's legs, regaurdless of wether typeabove or typebelow are given.
function searchDiamond(type, typeAbove, typeBelow, meta, metaAbove, metaBelow) {
  if (!type){type = 0}

  var y = 0

  for (dist = 0; dist < 20; dist = dist+1) {      // controls how many blocks out the diamond shape is
    for (x = -dist; x < dist+1; x = x+1) {        // go across the diamond shape, one corner to the other
      for (modz = -1; modz < 2; modz = modz +2) { // switch from top to bottom side of diamond shape
        //~ if (x == 0 && modz == 1){break}

        block  = bot.blockAt(  bot.entity.position.offset( x, y, modz*(dist-Math.abs(x)) )  )
        blockBelow = bot.blockAt(  bot.entity.position.offset( x, y-1, modz*(dist-Math.abs(x)) )  )
        blockAbove = bot.blockAt(  bot.entity.position.offset( x, y+1, modz*(dist-Math.abs(x)) )  )
        //~ console.log(modx*x+", "+y+", "+modz*z+"    "+block.type)

        if (block && type.indexOf(block.type) > -1 && (!typeAbove || (blockAbove && typeAbove && typeAbove.indexOf(blockAbove.type) > -1)) && (!typeBelow || (blockBelow && typeBelow && typeBelow.indexOf(blockBelow.type) > -1))  ) {
          if (!meta || (meta.indexOf(block.metadata) > -1 && (!metaAbove || (blockAbove && metaAbove && metaAbove.indexOf(blockAbove.metadata) > -1)) && (!metaBelow || (blockBelow && metaBelow && metaBelow.indexOf(blockBelow.metadata) > -1)) )  ) {
            console.log("+    Found!   Block: "+block.type+":"+block.metadata+"   Below: "+blockBelow.type+":"+blockBelow.metadata+"   Top: "+blockAbove.type+":"+blockAbove.metadata)
            return block
          }
        }

      } // for modZ
    } // for x
  } // dist
  return null
} // searchDiamond


// Search pattern that looks up and down in "lanes", useful for farms with crops in rows like sugarcane.
// type, typeAbove, and typeBelow are arrays containing ints of the block.type to find
// meta, metaAbove, and metaBelow are arrays containing ints of the block.metadata to find
// orientation can be [0 or null] or [1 or greater] to switch the direction of the lanes
//    0: rows going -x to +x
//    1: rows going -z to +z
// If the bot jumps between rows instead of going stright down one row, try changing the orientation :P
// The function searches blocks at the bots location, being where the bot's legs are as the center.
// returns the block found on the same height as the bot's legs, regaurdless of wether typeabove or typebelow are given.
function searchLane(type, typeAbove, typeBelow, meta, metaAbove, metaBelow, orientation) {
  if (!type){type = 0}
  if (!orientation){orientation = 0}

  var y = 0

  for (z = 0; z < 20; z = z+1) {
    for (x = 0; x < z*4; x = x+1) {
      //~ console.log(x+", "+z)
      for (modx = -1; modx < 2; modx = modx +2) {
        if (x == 0 && modx == 1){break}
        for (modz = -1; modz < 2; modz = modz +2) {
          if (z == 0 && modz == 1){break}

          if (orientation == 0){
            block  = bot.blockAt(  bot.entity.position.offset( modx*x, y-0, modz*z)  )
            blockBelow = bot.blockAt(  bot.entity.position.offset( modx*x, y-1, modz*z)  )
            blockAbove = bot.blockAt(  bot.entity.position.offset( modx*x, y+1, modz*z)  )
          } else { // this code switches the direction
            block  = bot.blockAt(  bot.entity.position.offset( modz*z, y-0, modx*x)  )
            blockBelow = bot.blockAt(  bot.entity.position.offset( modz*z, y-1, modx*x)  )
            blockAbove = bot.blockAt(  bot.entity.position.offset( modz*z, y+1, modx*x)  )
          }
          //~ console.log(modx*x+", "+y+", "+modz*z+"    "+block.type)

          if (block && type.indexOf(block.type) > -1 && (!typeAbove || (blockAbove && typeAbove && typeAbove.indexOf(blockAbove.type) > -1)) && (!typeBelow || (blockBelow && typeBelow && typeBelow.indexOf(blockBelow.type) > -1))  ) {
            if (!meta || (meta.indexOf(block.metadata) > -1 && (!metaAbove || (blockAbove && metaAbove && metaAbove.indexOf(blockAbove.metadata) > -1)) && (!metaBelow || (blockBelow && metaBelow && metaBelow.indexOf(blockBelow.metadata) > -1)) )  ) {
              console.log("+    Found!   Block: "+block.type+":"+block.metadata+"   Below: "+blockBelow.type+":"+blockBelow.metadata+"   Top: "+blockAbove.type+":"+blockAbove.metadata)
              return block
            }
          }

        } // for mody
      } // for modx
    } // for x
  } // for y
  return null
} // searchLane

function dig(tryNum) {
  if (!tryNum){tryNum = 1}
  if (tryNum > 10){console.log("Cobble ain't coming back!"), bot.end() }
	//~ console.log("Dig called")
  if(bot.targetDigBlock) {
    console.log("  already digging " + bot.targetDigBlock.name);
  } else {
    //~ var target = bot.blockAt(bot.entity.position.offset(0, 1, 2));
    //~ if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, 3))}
    //~ if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, 4))}

    var target = bot.blockAt(bot.entity.position.offset(0, 1, -2));
    if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, -3))}
    if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, -4))}
    if ( !target || target.type != 4 || !target.harvestTools) {console.log("All blocks dug?"); return setTimeout( function(){dig(tryNum+1)} , 1000)}


    if ( !target || !target.harvestTools ) {
      console.log("  Target block invalid?")
      console.log(target)
      //~ dsgafgadfg
      //~ setTimeout(function(){dsgafgadfg}, 2000)
      return setTimeout(dig, 100)
    }

    if ( !bot.heldItem || !target.harvestTools[bot.heldItem.type] || target.harvestTools[bot.heldItem.type] != true){
      return emptyAndEquipt()
    }

    if(target && bot.canDigBlock(target)) {
      //~ console.log("  starting to dig " + target.name);
      return bot.dig(target, onDiggingCompleted);
    } else {
      console.log("    cannot dig");
    }
  }

  function emptyAndEquipt(){
    console.log("  emptyAndEquipt");
    //~ bot.lookAt(bot.entity.position.offset(-1, -0.5, 0), false, function(){
      //~ bot.lookAt(bot.entity.position.offset(-1, -0.5, 0), true, function(){
        emptyInv(Object.keys(target.harvestTools), function(){
          setTimeout( function() {
            equipOneOf(Object.keys(target.harvestTools), 0, function(){
              target = bot.blockAt(bot.entity.position.offset(0, 1, 0));
              //~ console.log("   Djgging block under dropped items")
              //~ bot.dig(target, onDiggingCompleted);
              return dig()

            });
          }, 200)
        });
      //~ });
    //~ });
    return
  }

  function onDiggingCompleted() {
    console.log("    finished digging " + target.name);
    var block = bot.blockAt( mineflayer.vec3(target.position.x ,target.position.y ,target.position.z))
    if (block && block.id == 4) {
      console.log("!    Block was not mined. Re-equipping pickaxe")
      return setTimeout( emptyAndEquipt(), 200)
    } else {
      setTimeout(dig, 100)
    }
  }
}




function emptyInv(list, callback, num, notFirst) {
  if (!num){num=0}
  if (!notFirst){
    console.log("Dumping items from inventory not on this list:")
    console.log(list)
    notFirst = true
  }
  for (var i=num; i<bot.inventory.items().length; i++) {
    var index = list.indexOf( (0-bot.inventory.items()[i].type).toString() )
    if ( index != -1){
      console.log("Keeping single slot of "+bot.inventory.items()[i].type)
      //~ return bot.tossStack(bot.inventory.items()[i], function(){
      list[index] = "0"
      setTimeout(emptyInv(list, callback, num+1, true), 40)
      return
      //~ })
    } else if (list.indexOf( bot.inventory.items()[i].type.toString() ) == -1){
      console.log("List does not contain item "+bot.inventory.items()[i].type)
      return bot.tossStack(bot.inventory.items()[i], function(){
        setTimeout(emptyInv(list, callback, num, true), 40);
        return
      })
    }
  }
//~ asdfsagasd
  console.log("Finnished emptyInv")
  if (callback) return callback()
}





function build() {
  var referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1.0;
  bot.setControlState('jump', true);
  bot.on('move', placeIfHighEnough);

  function placeIfHighEnough() {
    if(bot.entity.position.y > jumpY) {
      bot.placeBlock(referenceBlock, mineflayer.vec3(0, 1, 0));
      bot.setControlState('jump', false);
      bot.removeListener('move', placeIfHighEnough);
    }
  }
}

function equipDirt() {
  bot.equip(0x03, 'hand', function(err) {
    if(err) {
      bot.chat("/tell MCorgano unable to equip dirt: " + err.message);
    } else {
      bot.chat("/tell MCorgano equipped dirt");
    }
  });
}

function sayItems(items) {
  items = items || bot.inventory.items();
  var output = items.map(itemToString).join(', ');
  if(output) {
    console.log(output)
  } else {
    console.log("empty");
  }
}

function itemToString(item) {
  if(item) {
    return item.type + " x " + item.count;
  } else {
    return "(nothing)";
  }
}




