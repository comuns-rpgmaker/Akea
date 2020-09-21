

//==========================================================================
// Akea Animated Battler Order
//----------------------------------------------------------------------------
// 09/11/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc Akea Animated Battler Order version: 1.0.0
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @orderAfter AkeaAnimatedBattleSystem
 * @orderBefore AkeaBattleCamera
 * 
 * @help Akea Animated Battler Order - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 

 * For this plugin, you will only need to configure its parameters and what it is asking, 
 * for each item. Do note, you can change the battler order image during the game using
 * Plugin Commands, in case your actor or the enemy changes the sprite.
 * 
 * @param actorFrame
 * @type struct<ImageConfig>[]
 * @text Actor Images
 * @desc Configure here the image of the actors on the order hud.
 * 
 * @param enemyFrame
 * @type struct<ImageConfigEnemy>[]
 * @text Enemy Images
 * @desc Configure here the image of the enemies on the order hud.

 * @param hudConfig
 * @type struct<HudPosition>
 * @text Main Hud
 * @desc Configure here the main Hud.

 * @param framePos
 * @type struct<FramePositions>
 * @text Frame Positions
 * @desc Configure here where the frames will start and end.
 *
 * @param startingOpacity
 * @type number
 * @default 150
 * @text Opacity of the frame
 * @desc What opacity the frame will have when not acting
 * 
 * @param startingScale
 * @type number
 * @default 0.7
 * @decimal 1
 * @text Scale of the frame
 * @desc What scale the frame will have when not acting
 *  
 * @param atbBar
 * @type boolean
 * @text Atb Bar
 * @desc Show the atb bar?

 * @command actorImage
 * @text 
 * @desc Change Actor Battler Order Image
 * 
 * @arg image
 * @type struct<ImageConfig>

 * @command enemyImage
 * @text 
 * @desc Change Enemy Battler Order Image
 * 
 * @arg image
 * @type struct<ImageConfigEnemy>
*/

/*~struct~HudPosition:
 * @param x
 * @type number
 * @text X Position
 * @desc X Position of the Hud
 * @param y
 * @type number
 * @text Y Position
 * @desc Y Position of the Hud
 * @param hudImage
 * @type file
 * @dir img/akea/
 * @text Hud Image
 * @desc Image of the hud
*/

/*~struct~FramePositions:
 * @param startX
 * @type number
 * @text X Start Position
 * @desc Starting Position X
 * @param endX
 * @type number
 * @text X End Position
 * @desc Ending Position X
 * @param startY
 * @type number
 * @text Y Start Position
 * @desc Starting Position Y
 * @param endY
 * @type number
 * @text Y End Position
 * @desc Ending Position Y
 * @param actX
 * @type number
 * @text X Acting Position
 * @desc Acting Position X, the position where the frame will be  when the battler is acting
 * @param actY
 * @type number
 * @text Y Acting Position
 * @desc Acting Position Y, the position where the frame will be  when the battler is acting
*/

/*~struct~ImageConfig:
 * @param battlerImage
 * @type file
 * @dir img/akea/
 * @text Battler Image
 * @desc Image of the battler on the hud
 * @param id
 * @type actor
 * @text actor
 * @desc actor of the database
*/

/*~struct~ImageConfigEnemy:
 * @param battlerImage
 * @type file
 * @dir img/akea/
 * @text Battler Image
 * @desc Image of the battler on the hud
 * @param id
 * @type enemy
 * @text enemy
 * @desc enemy of the database
*/

// DON'T MODIFY THIS PART!!!
var Akea = Akea || {};
Akea.AnimatedBattlerOrder = Akea.AnimatedBattlerOrder || {};
Akea.AnimatedBattlerOrder.VERSION = [1, 0, 0];
ImageManager.loadAkea = function (filename) {
    return this.loadBitmap("img/akea/", filename);
};

//////////////////////////////////////////////////////////////////////////////////////////////////
//                      Akea Animated Cursor
//////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------

(() => {
    const pluginName = "AkeaAnimatedBattlerOrder";
    const parameters = PluginManager.parameters(pluginName);
    let hudConfig = JSON.parse(parameters.hudConfig);

    Akea.AnimatedBattlerOrder.HudPos = [parseInt(hudConfig.x), parseInt(hudConfig.y)];
    Akea.AnimatedBattlerOrder.HudImg = hudConfig.hudImage;
    hudConfig = null;

    Akea.AnimatedBattlerOrder.ActorsJSON = JSON.parse(parameters.actorFrame);
    Akea.AnimatedBattlerOrder.Actors = [];
    Akea.AnimatedBattlerOrder.EnemiesJSON = JSON.parse(parameters.enemyFrame);
    Akea.AnimatedBattlerOrder.Enemies = [];
    let tempActor;
    for (const actor of Akea.AnimatedBattlerOrder.ActorsJSON) {
        tempActor = JSON.parse(actor);
        tempActor.id = parseInt(tempActor.id);
        Akea.AnimatedBattlerOrder.Actors.push(tempActor);
    }
    for (const enemy of Akea.AnimatedBattlerOrder.EnemiesJSON) {
        tempActor = JSON.parse(enemy);
        tempActor.id = parseInt(tempActor.id);
        Akea.AnimatedBattlerOrder.Enemies.push(tempActor);
    }
    tempActor = null;

    let frameConfig = JSON.parse(parameters.framePos);
    Akea.AnimatedBattlerOrder.frameRangeStart = [parseInt(frameConfig.startX), parseInt(frameConfig.startY)];
    Akea.AnimatedBattlerOrder.frameRangeEnd = [parseInt(frameConfig.endX), parseInt(frameConfig.endY)];
    Akea.AnimatedBattlerOrder.frameRangeActing = [parseInt(frameConfig.actX), parseInt(frameConfig.actY)];
    Akea.AnimatedBattlerOrder.frameScale = parseFloat(parameters.startingScale);
    Akea.AnimatedBattlerOrder.frameOpacity = parseInt(parameters.startingOpacity);
    Akea.AnimatedBattlerOrder.AtbBar = parameters.atbBar == "true" ? true : false;
    frameConfig = null;

    PluginManager.registerCommand(pluginName, "actorImage", args => {
        const arg = JSON.parse(args['image']);
        let tempResult = Akea.AnimatedBattlerOrder.Actors.filter(actor => actor.id === parseInt(arg.id))
        if (tempResult.length > 0)
            tempResult[0].battlerImage = arg.battlerImage;
    });
    PluginManager.registerCommand(pluginName, "enemyImage", args => {
        const arg = JSON.parse(args['image']);
        let tempResult = Akea.AnimatedBattlerOrder.Enemies.filter(enemy => enemy.id === parseInt(arg.id))
        if (tempResult.length > 0)
            tempResult[0].battlerImage = arg.battlerImage;
    });

    const _Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
    Spriteset_Battle.prototype.createLowerLayer = function () {
        _Spriteset_Battle_createLowerLayer.call(this, ...arguments);
        this.createAkeaBattleOrderHuds();
    };

    Spriteset_Battle.prototype.createAkeaBattleOrderHuds = function () {
        this.createBaseBattleOrderHud();
        this.createBaseBattlerOrder();
    };
    Spriteset_Battle.prototype.createBaseBattleOrderHud = function () {
        const sprite = new Sprite();
        sprite.bitmap = ImageManager.loadAkea(Akea.AnimatedBattlerOrder.HudImg);
        sprite.x = Akea.AnimatedBattlerOrder.HudPos[0];
        sprite.y = Akea.AnimatedBattlerOrder.HudPos[1];
        this._battleField.addChild(sprite);
    };
    Spriteset_Battle.prototype.createBaseBattlerOrder = function () {
        const enemies = $gameTroop.members();
        const sprites = [];
        for (const enemy of enemies) {
            sprites.push(new Sprite_AkeaOrder());
            sprites[sprites.length - 1].setBattler(enemy);
        }
        for (const sprite of sprites) {
            this._battleField.addChild(sprite);
        }
        this._actorBattleOrder = [];
        for (let i = 0; i < $gameParty.maxBattleMembers(); i++) {
            const sprite = new Sprite_AkeaOrder();
            this._actorBattleOrder.push(sprite);
            this._battleField.addChild(sprite);
        }
    };
    const _Spriteset_Battle_updateActors = Spriteset_Battle.prototype.updateActors;
    Spriteset_Battle.prototype.updateActors = function () {
        _Spriteset_Battle_updateActors.call(this, ...arguments);
        const members = $gameParty.battleMembers();
        for (let i = 0; i < this._actorSprites.length; i++) {
            this._actorBattleOrder[i].setBattler(members[i]);
        }
    };

    //-----------------------------------------------------------------------------
    // Sprite_AkeaOrder
    //
    // The superclass of Sprite_Actor and Sprite_Enemy.

    function Sprite_AkeaOrder() {
        this.initialize(...arguments);
    }
    Sprite_AkeaOrder.prototype = Object.create(Sprite.prototype);
    Sprite_AkeaOrder.prototype.constructor = Sprite_AkeaOrder;

    Sprite_AkeaOrder.prototype.initialize = function () {
        Sprite.prototype.initialize.call(this);
        this.loadBaseSprites();
        this.loadVariables();
        this._battler = null;
    };

    Sprite_AkeaOrder.prototype.loadVariables = function () {
        this._startingPoint = Akea.AnimatedBattlerOrder.frameRangeStart;
        this._rangeX = Akea.AnimatedBattlerOrder.frameRangeEnd[0] - Akea.AnimatedBattlerOrder.frameRangeStart[0];
        this._rangeY = Akea.AnimatedBattlerOrder.frameRangeEnd[1] - Akea.AnimatedBattlerOrder.frameRangeStart[1];
        this._actingPos = Akea.AnimatedBattlerOrder.frameRangeActing;
    };

    Sprite_AkeaOrder.prototype.loadBaseSprites = function () {
        this._hudFront = new Sprite();
        this._hudFront.anchor.x = this._hudFront.anchor.y = 0.5;
        this.resetPosition();
        this.addChild(this._hudFront);
    };
    Sprite_AkeaOrder.prototype.setBattler = function (battler) {
        if (battler != this._battler) {
            let akeaFrame = "";
            let tempResult;
            this._battler = battler;
            if (battler.isActor()) {
                tempResult = Akea.AnimatedBattlerOrder.Actors.filter(actor => actor.id === battler.actorId())
                if (tempResult.length > 0)
                    this._hudFront.bitmap = ImageManager.loadAkea(tempResult[0].battlerImage);
            } else {
                tempResult = Akea.AnimatedBattlerOrder.Enemies.filter(enemy => enemy.id === battler.enemyId())
                if (tempResult.length > 0)
                    this._hudFront.bitmap = ImageManager.loadAkea(tempResult[0].battlerImage);
            }

        }
    };
    Sprite_AkeaOrder.prototype.update = function () {
        Sprite.prototype.update.call(this);
        if (this._battler && this._battler.isAlive()) {

            if (this._battler.isActing() || (Akea.BattleSystem && this._battler.getAkeaAnimatedBSActions().hasActions())) {
                this.moveToCenter();
            }
            else {
                this.resetPosition();
                this._hudFront.x = this._startingPoint[0] + this._rangeX * this._battler.tpbChargeTime();
                this._hudFront.y = this._startingPoint[1] + this._rangeY * this._battler.tpbChargeTime();
            }

        }
    };

    Sprite_AkeaOrder.prototype.resetPosition = function () {
        this._hudFront.x = Akea.AnimatedBattlerOrder.frameRangeStart[0];
        this._hudFront.y = Akea.AnimatedBattlerOrder.frameRangeStart[1];
        this._hudFront.scale.x = this._hudFront.scale.y = Akea.AnimatedBattlerOrder.frameScale;
        this._hudFront.opacity = Akea.AnimatedBattlerOrder.frameOpacity;
        this._centerCount = 0;
    };

    Sprite_AkeaOrder.prototype.moveToCenter = function () {
        if (this._centerCount == 0) {
            this._diffX = (this._actingPos[0] - this._hudFront.x) / 10
            this._diffY = (this._actingPos[1] - this._hudFront.y) / 10
        }
        this._centerCount++;
        if (this._centerCount <= 10) {
            this._hudFront.x += this._diffX
            this._hudFront.y += this._diffY
            if (this._centerCount == 10) {
                this._hudFront.x = this._actingPos[0];
                this._hudFront.y = this._actingPos[1];
            }
            this._hudFront.opacity += 15;
            if (this._hudFront.scale.x < 1)
                this._hudFront.scale.x = this._hudFront.scale.y += 0.05;
        }

    };

    Window_StatusBase.prototype.placeTimeGauge = function (actor, x, y) {
        if (Akea.AnimatedBattlerOrder.AtbBar) {
            this.placeGauge(actor, "time", x, y);
        }
    };
})();