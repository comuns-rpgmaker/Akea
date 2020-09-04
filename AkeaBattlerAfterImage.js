
/*:
//=============================================================================
// RPG Maker MZ - Akea Battler After Image
//=============================================================================
 * @target MZ
 * @plugindesc Akea Battler After Image
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @base AkeaAnimatedBattleSystem
 * @orderAfter AkeaAnimatedBattleSystem

 * @help Akea Battler After Image - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 

 * Battle System Akea Battler After Image works on :
 * - Akea Animated Battle System

 * Configure the parameters to use as base parameters for the after Image, 
 * each parameter is explained how you can control the after image.
 * After you configured each parameter you can call it on the Akea Animated Battle System
 * in the same way you call actions/animations/hits in the notetag
 * You can call a single id you configured on the parameters like this:
 * <akeaAfterImage>id: 1</akeaAfterImage>
 * You can also configure directly in the action all parameters Ex:
 * <akeaAfterImage>
 * id: 1
 * shadowNumber: 10
 * frequency: 10
 * hueShift: 5
 * hueVariation: 20
 * fadeSpeed: 5
 * </akeaAfterImage>
 * 
 * You can also just alter the parameter you want from one configured on the Plun Parameters
 * Example:
 * 
 * <akeaAfterImage>
 * id: 1
 * fadeSpeed: 50
 * </akeaAfterImage>
 * 
 * The one above will have all traits from the After Image of id 1 on the Plugin Parameters, 
 * but the fade speed will be altered.
 * 
 * To stop an afterimage during an action, just use
 * <akeaStopAfterImage><\akeaStopAfterImage>
 * 
 * 

 * @param After Image Configuration
 * @type struct<AfterImage>[]
 * @text After Images Base Configuration

 */

/*~struct~AfterImage:
 * @param shadow number
 * @type number
 * @default 30
 * @text Quantity
 * @desc Quantity of after images
 * @param frequency
 * @type number
 * @default 3
 * @text Frequency
 * @desc The lower, the faster the afterImages appear
 * @param fadeSpeed
 * @type number
 * @default 10
 * @text Fade Speed
 * @desc The higher, the faster the afterImages fade away
 * @param hueShift
 * @type number
 * @default 0
 * @text Hue
 * @desc If you want to change colors of the after images
 * @param hueVariation
 * @type number
 * @default 0
 * @text Hue Variation
 * @desc The amount of shift you want the color of the shadow to have from one another
 */


// NÃO MEXE AQUI POR FAVOR :(!
// No touching this part!
var Akea = Akea || {};
Akea.BattleAfterImage = Akea.BattleAfterImage || {};
Akea.BattleAfterImage.VERSION = [1, 0, 1];

if (!Akea.BattleSystem) throw new Error("AkeaBattleAfterImage plugin needs the AkeaAnimatedBattleSystem base.");
if (Akea.BattleSystem.VERSION < [1, 1, 0]) throw new Error("This plugin only works with versions 1.1.0 or higher of the Akea Animated Battle System ");


//////////////////////////////////////////////////////////////////////////////////////////////////
//                      Akea Battler After Image
//////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------
(() => {
    const pluginName = "AkeaBattlerAfterImage";
    Akea.params = PluginManager.parameters(pluginName);
    Akea.BattleAfterImage.imageGlobaConfigs = JSON.parse(Akea.params['After Image Configuration']);
    Akea.BattleAfterImage.imageConfigs = [];
    for (const afterImage of Akea.BattleAfterImage.imageGlobaConfigs) { Akea.BattleAfterImage.imageConfigs.push(JSON.parse(afterImage)) };
    //-----------------------------------------------------------------------------
    // Sprite_Battler_AfterImage
    //
    // The sprite for displaying a battler After Image
    //-----------------------------------------------------------------------------
    function Sprite_Battler_AfterImage() {
        this.initialize(...arguments);
    }
    Sprite_Battler_AfterImage.prototype = Object.create(Sprite.prototype);
    Sprite_Battler_AfterImage.prototype.constructor = Sprite_Battler_AfterImage;

    Sprite_Battler_AfterImage.prototype.initialize = function () {
        Sprite.prototype.initialize.call(this);
        this._realX = 0;
        this._realY = 0;
        this.anchor.x = 0.5;
        this.anchor.y = 1;
    };
    Sprite_Battler_AfterImage.prototype.update = function () {
    }

    Sprite_Battler_AfterImage.prototype.setBitmap = function (bitmap) {
        this.bitmap = bitmap;
    };
    Sprite_Battler_AfterImage.prototype.setAkeaParameters = function (maxWidth, maxHeight, maxFrame, akeaMirror, akeaMirroredMoves,
        x, y) {
        this.akeaAnimatedBSMaxWidth = maxWidth;
        this.akeaAnimatedBSMaxHeight = maxHeight;
        this.akeaMaxFrame = maxFrame;
        this._akeaMirror = akeaMirror;
        this._akeaMirroredMoves = akeaMirroredMoves;
        this._realX = x;
        this._realY = y;
        this.x = x;
        this.y = y;
        this._zIndex = this.y + 1;
    };
    Sprite_Battler_AfterImage.prototype.updatePositions = function (x, y) {
    };

    Sprite_Battler_AfterImage.prototype.updateFrame = function (isActor, motion, pattern) {
        this._motion = motion;
        this._pattern = pattern;
        if (isActor) {
            Sprite_Actor.prototype.updateFrame.call(this, ...arguments);
        } else {
            Sprite_Enemy.prototype.updateFrame.call(this, ...arguments);
        }
    }
    Sprite_Battler_AfterImage.prototype.updateAkeaFrame = function () {
        const bitmap = this.bitmap;
        if (bitmap) {
            const motionIndex = this._motion ? this._motion.index : 0;
            const pattern = this._pattern < this.akeaMaxFrame ? this._pattern : 1;
            const cw = bitmap.width / this.akeaAnimatedBSMaxWidth;
            const ch = bitmap.height / this.akeaAnimatedBSMaxHeight;
            const cx = Math.floor(motionIndex / this.akeaAnimatedBSMaxHeight) * 3 + pattern;
            const cy = motionIndex % this.akeaAnimatedBSMaxHeight;
            this.setFrame(cx * cw, cy * ch, cw, ch);
            this.scale.x = this._akeaMirror ? -1 : 1;
            if (this._akeaMirroredMoves) { this.scale.x *= -1 };
        }
        return;
    }
    const _akeaBattlerAfterImage_Sprite_Battler_initialize = Sprite_Battler.prototype.initialize;
    Sprite_Battler.prototype.initialize = function (battler) {
        _akeaBattlerAfterImage_Sprite_Battler_initialize.call(this, ...arguments);
        this._akeaBattlersAfterImage = new Game_AkeaBattlerAfterImages();
    };
    const _akeaBattlerAfterImage_Sprite_Battler_update = Sprite_Battler.prototype.update;
    Sprite_Battler.prototype.update = function () {
        this._akeaBattlersAfterImage.updateAkeaAfterImagePosition(this);
        _akeaBattlerAfterImage_Sprite_Battler_update.call(this, ...arguments);
    }
    const _specificName_Game_Battler_callAkeaActions = Game_Battler.prototype.callAkeaActions
    Game_Battler.prototype.callAkeaActions = function (actionName, parameters, action, targets) {
        _specificName_Game_Battler_callAkeaActions.call(this, ...arguments);
        let regex = /(\w+):\s*([^\s]*)/gm;
        let obj = {};
        let id = false;
        do {
            param = regex.exec(parameters);
            if (param) {
                if (RegExp.$1 == "id") {
                    id = parseInt(RegExp.$2);
                } else {
                    obj[RegExp.$1] = RegExp.$2;
                }
            }
        } while (param);
        if (!id) { id = 1 };
        if (actionName == "AfterImage") {
            this._akeaAnimatedBSActions.addCustomAddon(id, targets, actionName, this, action, obj);
        } else if (actionName == "StopAfterImage") {
            this._akeaAnimatedBSActions.addCustomAddon(id, targets, actionName, this, action, obj);
        }
    }
    const _specificName_Sprite_Battler_manageAkeaActions = Sprite_Battler.prototype.manageAkeaActions
    Sprite_Battler.prototype.manageAkeaActions = function (action) {
        _specificName_Sprite_Battler_manageAkeaActions.call(this, ...arguments);
        switch (action.getActionType()) {
            case "AfterImage":
                this._akeaBattlersAfterImage.loadConfiguration(action);
                this._akeaBattlersAfterImage.startImages(this);
                break;
            case "FinishAction":
            case "StopAfterImage":
                this._akeaBattlersAfterImage.stopImages();
                break;
        }
    }
    //-----------------------------------------------------------------------------
    // Game_AkeaBattlerAfterImages
    //
    // The game object class for managing the after images.
    //-----------------------------------------------------------------------------
    function Game_AkeaBattlerAfterImages() {
        this.initialize(...arguments);
    }

    Game_AkeaBattlerAfterImages.prototype.initialize = function () {
        this._maxImages = 40 - 1;
        this._afterImageSprites = [];
        this._showingAfterImages = false;
        this._frequency = 5;
        this._hueShift = 0;
        this._variableHueShift = 0;
        this._fadeSpeed = 1;
    };
    Game_AkeaBattlerAfterImages.prototype.loadConfiguration = function (action) {
        const configuration = Akea.BattleAfterImage.imageConfigs[action.getId() - 1];
        this._showingAfterImages = true;
        this._akeaSequenceActual = 0;
        this._maxImages = parseInt(configuration["shadow number"]);
        this._frequency = parseInt(configuration["frequency"]);
        this._hueShift = parseInt(configuration["hueShift"]);
        this._variableHueShift = parseInt(configuration["hueVariation"]);
        this._fadeSpeed = parseInt(configuration["fadeSpeed"]);
        const params = action.getObject();
        if (params) {
            if (params["shadowNumber"]) { this._maxImages = parseInt(params["shadowNumber"]) };
            if (params["frequency"]) { this._frequency = parseInt(params["frequency"]) };
            if (params["hueShift"]) { this._hueShift = parseInt(params["hueShift"]) };
            if (params["hueVariation"]) { this._variableHueShift = parseInt(params["hueVariation"]) };
            if (params["fadeSpeed"]) { this._fadeSpeed = parseInt(params["fadeSpeed"]) };
        }
    }
    Game_AkeaBattlerAfterImages.prototype.stopImages = function () {
        this._showingAfterImages = false;
        for (const sprite of this._afterImageSprites) { sprite.opacity = 0 };
    }
    Game_AkeaBattlerAfterImages.prototype.startImages = function (sprite) {
        this._hueShift = 360 - sprite.mainSprite()._hue;
        for (var n = 0; n < this._maxImages; n++) {
            if (!this._afterImageSprites[n]) {
                this._afterImageSprites[n] = new Sprite_Battler_AfterImage();
                BattleManager.addAkeaAfterImages(this._afterImageSprites[n]);
            }
            this._afterImageSprites[n].setBitmap(sprite.mainSprite().bitmap);
            this._afterImageSprites[n].setHue(this._hueShift);
            this._hueShift += n * this._variableHueShift;
        }
    }
    Game_AkeaBattlerAfterImages.prototype.updateAkeaAfterImagePosition = function (battlerSprite) {
        if (this._showingAfterImages) {
            for (var n = 0; n < this._maxImages; n++) {
                this._afterImageSprites[n].opacity -= this._fadeSpeed;
                if (n == this._akeaSequenceActual && Graphics.frameCount % this._frequency == 0) {
                    this.setAkeaAfterImagePosition(n, battlerSprite);
                    this._afterImageSprites[n].opacity = 255
                }
            }
            if (Graphics.frameCount % this._frequency == 0)
                this._akeaSequenceActual = this._akeaSequenceActual < this._maxImages ? this._akeaSequenceActual + 1 : 0;
        }
    }
    Game_AkeaBattlerAfterImages.prototype.setAkeaAfterImagePosition = function (n, battlerSprite) {
        if (Akea.BattleSystem) {
            this._afterImageSprites[n].setAkeaParameters(battlerSprite.akeaAnimatedBSMaxWidth,
                battlerSprite.akeaAnimatedBSMaxHeight, battlerSprite.akeaMaxFrame, battlerSprite._akeaMirror, battlerSprite._akeaMirroredMoves,
                battlerSprite.x, battlerSprite.y)
        }
        else {
            this._afterImageSprites[n].setAkeaParameters(battlerSprite.akeaAnimatedBSMaxWidth,
                battlerSprite.akeaAnimatedBSMaxHeight, battlerSprite.akeaMaxFrame, battlerSprite._akeaMirror, battlerSprite._akeaMirroredMoves,
                battlerSprite.x, battlerSprite.y)
        }
        if (battlerSprite._battler)
            this._afterImageSprites[n].updateFrame(battlerSprite._battler.isActor(), battlerSprite._motion, battlerSprite._pattern);
    }
    BattleManager.addAkeaAfterImages = function (sprite) {
        this._spriteset._battleField.addChild(sprite);
    };
    const _akeaBattlerAfterImage_Sprite_Battler_onMoveEnd = Sprite_Battler.prototype.onMoveEnd;
    Sprite_Battler.prototype.onMoveEnd = function () {
        this._akeaBattlersAfterImage.stopImages();
        _akeaBattlerAfterImage_Sprite_Battler_onMoveEnd.call(this, ...arguments);
    };
})();