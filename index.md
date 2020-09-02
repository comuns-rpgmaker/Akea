
![Image](https://i.imgur.com/bVFRNzi.png)

## Intro
This document will cover all the bases to the Akea Animated Battle System, which I will refer it as AABS for the rest of this document. After this document, you should be ready to create your dream battle system. If you need further help, join us on discord for support/bug reports: https://discord.gg/wsPeqeA
First off lets see each term needed for our battle system!

### Spritesheets
Spritesheets are how animation is done on AABS, they are easy to work and manipulate.
Example:
![Image](https://i.imgur.com/IbS9BDx.png)

Akea works manipulating each moment and making everything feel smooth and flowing naturally, AABS accepts all Spritesheets, but you will need to configure them, which is showed later in this document.

### Poses
The poses are the stance a battler is at the moment, it shows the type of action the battler is currently doing or will do.
This would be an attack pose:
![Image](https://i.imgur.com/qq3z9m9.png)

Sleep pose:
![Image](https://i.imgur.com/2UiU6ak.png)

And so on, they dictate the action of the battler

### Actions
Actions are what moves the battlers. An action would be making a battler run forward, or jump, in AABS you need to combine action with poses. So a running action could be making a battler go from one end of the screen to the other using the running pose. 
Or a step back action: 
![Image](https://i.imgur.com/tfRoYp8.png)

### User and Target
User is the one that will star the actions be it attacking, casting a spell or other things and the target will be its target of action, like an enemy on the battlefield.

## Configuration
Now that you know the terms, it is time to start configuring the system! First off lets talk how to configure everything on the parameters!


###Spritesheets
![Image](https://i.imgur.com/Wm25flO.png)

Left Side: Here you can see a list of spritesheets, you can add any number of spritesheets you need for your game, Once you click to add one you will get to configure more 3 parameters:

Right Side:
1. FrameNum - The number of frames for each pose in the spritesheet
2. SpritesheetHeight - The number of poses from up to down in the sheet
3. SpritesheetWidth - The number of poses from left to right

![Image](https://i.imgur.com/91BqbDT.png)

Actor and enemy spritesheets are basically the same, to set up a specific spritesheet for an actor or enemy you can use the same spritesheet number configured above.
If you configured 2 spritesheets, id 1 will be the first one and id 2 the second.

![Image](https://i.imgur.com/oAi4RX9.png)

In this image we have configured spritesheet of id 1 for both actors of id 4 and 1 of the database.

Specific for enemies you can also point out to a svBattler, this is optional! You can also use directly the image from the DB for the enemies, but because of the awkward positioning of full spritesheets there, this has been made to make things easier:

![Image](https://i.imgur.com/HbRqQQx.png)

###Poses
Now lets configure the poses of our AABS!
You can add as many poses as you want and you can have multiple poses with the same name, since we will append each pose to a battler, which means different battlers can have different pose configuration for the same pose!
MV/MZ has its default poses which are the following:
 * walk: 
 * wait: 
 * chant: 
 * guard: 
 * damage: 
 * evade: 
 * thrust: 
 * swing: 
 * missile:
 * skill: 
 * spell: 
 * item: 
 * escape: 
 * victory:
 * dying: 
 * abnormal
 * sleep: 
 * dead:

If you do not configure those poses AABS will use default MZ pose configuration, if you do configure it, your configuration will overwrite that pose for the battler you appended the pose into.

![Image](https://i.imgur.com/tUTLMuE.png)
Left Side: All the poses you want to configure, the number is ilimited, just add a new pose you wish to make!

Right Side:

1. info - This area is free to use as you wish, this is to help organizing your poses.
2. name - name of the pose, if you use any of the default poses, it will be overwritten, you can add any name for poses you want to use in specific actions.
3. InOut - This only works with the loop as true, this is if you wish for the pose to loop like 1-2-3-4-1-2-3-4 or 1-2-3-4-3-2-1-2-3, these numbers are the frames of your battler.
4. loop - If this is set true, animation will keep on looping as long as the battler holds this pose, if it is off, battler will stop on the last frame.
5. frequency - It is the frequency in which the frame change happens, for example an 8 means it will wait 8 frames to change the battler from frame 1 to 2. As default MZ is set to run 60 frames per second, so 8 frames would be 8/60 seconds before changing it.
6. poseIndex - it is the row of the spritesheet, below is each pose index on the default MZ spritesheet starting from 0:

![Image](https://i.imgur.com/ASGfiZT.png)

###Appending Poses

Now that you have configured your poses you can append them to actors and enemies!
Just go to parameters and choose Actor/Enemy Poses Configuration

![Image](https://i.imgur.com/9hSg2Uq.png)

You will need to create a new entry for each actor/enemy you want to append your new pose configuration, do remember if you don't append your new poses AABS will just use the MZ default pose.

Then, for each battler you set its id on the database and then just add as many poses as you need for that battler!
![Image](https://i.imgur.com/MmGeTHN.png)

the number is the same id of the pose configured on the poses parameters.

###Actions
Now it is time to create actions!
Do note, actions are small movements, you will be able to join actions to create a big action instead. This is made so that its much less work for you to create actions, and you can reuse a lot of actions if you do need.

![Image](https://i.imgur.com/ur2VWNm.png)

Left Side: Your actions! Create as many as you like!
Right Side: 
1. info - This area is free to use as you wish, this is to help organizing your actions.
2. time - this is the amount of time (in frames) the action will take to complete, the same battler can not do another action while the previous is still happening.
3. movementType - 
![Image](https://i.imgur.com/WVmuPHT.png)
3.1 absolute - movement will happen according to the battler's current place.
3.2 fromHome - movement will happen taking in consideration its initial position.
3.3 target - battler will go towards the target of the skill, do note multiple targets means battler will go towards the first target only.
3.4 noMove - battler will do its action on its current position.
4. offsetX - based on the movement type, this is how much on the X-axis the battler will go. Ex: an offsetX of 50 on the target movement type means the battler will stop 50 pixels to the right of the target.
5. offsetY - same as X, but instead with Y-axis
6. jumpHeight - the jump height the battler will make when doing the action.
7. levitate - if set true, shadows will not follow the battler.
8. mirror - you can mirror the action with this set on, so battlers can face both directions.


###Extra Configuration

![Image](https://i.imgur.com/zSuXA4O.png)

1. Script calls - here you can set up script calls as actions, they will be called on the skill notes, I will show below how to correctly call them. This has been made to make it easier for add-ons of different developers work just fine with the system.
![Image](https://i.imgur.com/WrmblQ4.png)
2. Entry Actors - animation of actors entering the battle.
2.1  action - action id to append to this movement.
2.2 offsetX - offset in X-axis where battlers will start.
2.3 offsetY - same as above, but in Y-axis.
2.4 homeX - final actor position in X, this can be a formula, index is the index in the party position.
2.5 homeY - same as above, but in Y-axis.
3. Entry Enemies - same as above, but with enemies, since their positions are fixed on the database, you can ignore the homeX/homeY configuration.
4. Step Forward Action - the action that makes actors step forward when selected.
5. Step Back Action - Action the battlers take when going back "home"
6. Retreat Action - Action of the battlers when they run from a battle
7. Damage Action - Action of the battlers when they take damage
8. Evade Action - Action of the battlers when they evade a hit.


## Database Configuration
Now that you have configured all the parameters it is time to put everything together! In this section you will learn how to properly create actions for skills and items.

###Skills and Items
To configure AABS correctly you will use Note part of the Skills/Items to configure (Future update will let you use from weapons also)
![Image](https://i.imgur.com/Mo1miQV.png)

How does it work? AABS will read each line individually and execute an action according to it if AABS finds it configured on the parameters.
The action after it will not be executed until the action before meets its conditions, do notice this only applies for individual battlers, when making actions to other battlers they will happen simultaneously! This makes everything much more dynamic!
So what are the tags you can add to notes?

<akeaActions number> : Number of the action, Ex: <akeaAction 2> to get the second
action on the parameters, this are the actions that you have configured before! Join them to create
a single action animation.

<akeaActionEnemy number> : exactly the same as above, but the action will be dealt
to the target and not the user. This is called only after the action before is finished,
but this has basically no delays to call the next action, the enemy will do its action in
parallel with this battler action!

<akeaAniTarget number> : Play a database animation on the target Ex:
<akeaAniTarget 55> : Plays animation id 55 on the Target

<akeaAniSelf number> : Same as above, but on the user Ex:
<akeaAniSelf 55> : Plays animation id 55 on the User

<akeaScript number> : Calls the expression configured on the Script Call parameters:
<akeaScript 33> : Calls the expression 33 on the parameters

<akeaSkill number> : Appends skill to the current skill, just be careful to not make loops:
<akeaSkill 27> : Calls the skill 27, all animations will be added to the current one

<akeaHit damage> : Calls a damage to the target, this damage is in percent according 
to the same formula in that skill on the database
<akeaHit 50> : Calls a hit for aproximately 50% damage of the skill formula

<akeaHitWeapon damage> : Same as above, but with weapon animation
to the same formula in that skill on the database
<akeaHitWeapon 30> : Calls a hit for aproximately 30% damage of the skill formula

<akeaHitAll damage> : Same as above, but with all targets
<akeaHitAll 50> : Calls a hit for aproximately 50% damage of the skill formula

<akeaWait time> : Waits a certain time before the next action, in frames, usually 60 = 1 second
<akeaHitAll 60> : Waits 60 frames (1 second)

<akeaRandomize 1> : Randomizes the target, choose random target on the skill and this
will change targets in the middle of the Action!

###Closing
This should be enough for you all incredible gamedevs to create an amazing battle! Test it out and with some tries you will easily be able to create incredible action sequences!

## Support or Contact

Did you like the AABS? leave us a comment on discord! I hope you all liked the Akea Animated Battle System! We are continuosly working for improvements to give you all the best experience when it comes to battling o/. 
