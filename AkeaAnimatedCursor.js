
//==========================================================================
// Akea Animated Cursor
//----------------------------------------------------------------------------
// 09/11/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc Akea Animated Cursor version: 1.0.0
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @orderAfter AkeaAnimatedBattleSystem
 * @orderBefore AkeaBattleCamera
 * 
 * @help Akea Animated Cursor - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 

 * For this plugin, you will only need to configure its parameters and what it is asking, 
 * for each item. Do remember to configure all of them!
 * 
 * @param defaultWindow
 * @type boolean
 * @text Default Windows
 * @desc Check here if you want to still display actor/enemy windows.
 * 
 * @param MainCursor
 * @type struct<CursorConfig>
 * @text Main Cursor Configuration
 * @desc Configure here the main Cursor.
 * 
 * @param SecondCursor
 * @type struct<CursorConfig>
 * @text Main Cursor Configuration
 * @desc Configure here the secondary Cursor, you can leave it blank if you use only 1 image.
 * 
 * @param actorText
 * @type struct<TextConfig>
 * @text Actor Names Configuration
 * @desc Configure here the text of the actor.
 *
 * @param enemyText
 * @type struct<TextConfig>
 * @text Enemy Names Configuration
 * @desc Configure here the text of the enemy. 
*/


/*~struct~TextConfig:
 * @param textColor
 * @type text
 * @text Text Color
 * @default FFFFFF
 * @desc The text color in hexadecimal
 * @param outlineColor
 * @type text
 * @text Outline Color
 * @default 000000
 * @desc The outline color in hexadecimal
 * @param outlineWidth
 * @type number
 * @text Outline Width
 * @default 3
 * @decimals 0
 * @desc The outline width of the font
 * @param fontSize
 * @type number
 * @text Font Size
 * @decimals 0
 * @default 20
 * @desc The size of the font, 0 to disable names.
 * @param x
 * @type number
 * @text X Position
 * @decimals 0
 * @default 0
 * @min -1000
 * @desc The position of the text for correction in X.
 * @param y
 * @type number
 * @text Y Position
 * @decimals 0
 * @default 0
 * @min -1000
 * @desc The position of the text for correction in Y.
*/

/*~struct~CursorConfig:
 * @param cursorImage
 * @type file
 * @dir img/akea/
 * @text Cursor Image
 * @desc Image of the Cursor
 * @param maxMotion
 * @type number
 * @text Maximum motion
 * @default 6
 * @min 0
 * @decimals 0
 * @desc How much the cursor will move in pixels
 * @param motionSpeed
 * @type number
 * @decimals 2
 * @min 0
 * @text Speed of the movement
 * @default 0.5
 * @desc How fast will the movement be
 * @param y
 * @type number
 * @text y offset
 * @default 25
 * @min -1000
 * @decimals 0
 * @desc Correction value for the cursor
 * @param rotation
 * @type number
 * @decimals 2
 * @min 0
 * @default 0.05
 * @desc Rotation speed of the cursor on its axis, 0 for none.
*/

// DON'T MODIFY THIS PART!!!
var Akea = Akea || {};
Akea.AnimatedCursor = Akea.AnimatedCursor || {};
Akea.AnimatedCursor.VERSION = [1, 0, 0];


ImageManager.loadAkea = function (filename) {
    return this.loadBitmap("img/akea/", filename);
};
//////////////////////////////////////////////////////////////////////////////////////////////////
//                      Akea Animated Cursor
//////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------

(() => {
    const pluginName = "AkeaAnimatedCursor";
    const parameters = PluginManager.parameters('AkeaAnimatedCursor');
    Akea.AnimatedCursor.MainCursor = JSON.parse(parameters.MainCursor);
    Akea.AnimatedCursor.SecondCursor = JSON.parse(parameters.SecondCursor);
    Akea.AnimatedCursor.DefaultWindow = parameters.defaultWindow == "true" ? true : false;
    Akea.AnimatedCursor.ActorFont = JSON.parse(parameters.actorText);
    Akea.AnimatedCursor.EnemyFont = JSON.parse(parameters.enemyText);
    const _Sprite_Battler_initialize = Sprite_Battler.prototype.initialize;
    Sprite_Battler.prototype.initialize = function (battler) {
        _Sprite_Battler_initialize.call(this, ...arguments);
        this.createCursorControls();
    };

    Sprite_Battler.prototype.createCursorControls = function () {
        this._cursor1Control = {
            directionUp: true,
            directionRotation: true,
            maxMotion: parseInt(Akea.AnimatedCursor.MainCursor.maxMotion),
            motionSpeed: parseFloat(Akea.AnimatedCursor.MainCursor.motionSpeed),
            y: parseInt(Akea.AnimatedCursor.MainCursor.y),
            rotation: parseFloat(Akea.AnimatedCursor.MainCursor.rotation)
        };
        this._cursor2Control = {
            directionUp: true,
            directionRotation: true,
            maxMotion: parseInt(Akea.AnimatedCursor.SecondCursor.maxMotion),
            motionSpeed: parseFloat(Akea.AnimatedCursor.SecondCursor.motionSpeed),
            y: parseInt(Akea.AnimatedCursor.SecondCursor.y),
            rotation: parseFloat(Akea.AnimatedCursor.SecondCursor.rotation)
        };
    };

    const _Sprite_Battler_updateBitmap = Sprite_Battler.prototype.updateBitmap;
    Sprite_Battler.prototype.updateBitmap = function () {
        _Sprite_Battler_updateBitmap.call(this, ...arguments);
        const name = this._battler.battlerName();
        if (this._battlerName !== name) {
            if (!this._cursorMainSprite) {
                this.createAkeaAnimatedCursor();
                this.createAkeaTargetName();
            }
            this._akeaCursors._zIndex = 1000;
            this._akeaCursors.anchor.x = this._akeaCursors.anchor.y = 0.5;
        }
        this.updateAkeaCursor();
    };

    Sprite_Battler.prototype.createAkeaTargetName = function () {
        this._akeaTargetName = new Sprite();
        this._akeaTargetName.bitmap = new Bitmap(360, 120)
        this._akeaTargetName.anchor.x = this._akeaTargetName.anchor.y = 0.5;
        if (this._battler.isEnemy()) {
            if (Akea.BattleSystem)
                this._akeaTargetName.scale.x = -1;
            this._akeaTargetName.bitmap.textColor = "#".concat(Akea.AnimatedCursor.EnemyFont.textColor);
            this._akeaTargetName.bitmap.outlineColor = "#".concat(Akea.AnimatedCursor.EnemyFont.outlineColor);
            this._akeaTargetName.bitmap.outlineWidth = parseInt(Akea.AnimatedCursor.EnemyFont.outlineWidth);
            this._akeaTargetName.bitmap.fontSize = parseInt(Akea.AnimatedCursor.EnemyFont.fontSize);
        } else {
            this._akeaTargetName.bitmap.textColor = "#".concat(Akea.AnimatedCursor.ActorFont.textColor);
            this._akeaTargetName.bitmap.outlineColor = "#".concat(Akea.AnimatedCursor.ActorFont.outlineColor);
            this._akeaTargetName.bitmap.outlineWidth = parseInt(Akea.AnimatedCursor.ActorFont.outlineWidth);
            this._akeaTargetName.bitmap.fontSize = parseInt(Akea.AnimatedCursor.ActorFont.fontSize);
        }
        this._akeaTargetName.bitmap.drawText(this._battler.name(), 0, 0, 360, 120, "center")
        this._akeaTargetName.opacity = 0;
        this.addChild(this._akeaTargetName);
    };

    Sprite_Battler.prototype.createAkeaAnimatedCursor = function () {
        this._akeaCursors = new Sprite();
        this._akeaCursors.bitmap = new Bitmap(500, 500)
        this._akeaCursors.opacity = 0;
        this._akeaCursors.anchor.x = this._akeaCursors.anchor.y = 0.5;
        this._akeaCursors.scale.x = -1;
        this.addChild(this._akeaCursors);
        this._cursorMainSpriteMain = new Sprite();
        this._cursorMainSpriteMain.bitmap = ImageManager.loadAkea(Akea.AnimatedCursor.MainCursor.cursorImage)
        this._akeaCursors.addChild(this._cursorMainSpriteMain);
        this._cursorMainSpriteMain.anchor.x = this._cursorMainSpriteMain.anchor.y = 0.5;
        this._cursorMainSpriteExtra = new Sprite();
        this._cursorMainSpriteExtra.bitmap = ImageManager.loadAkea(Akea.AnimatedCursor.SecondCursor.cursorImage)
        this._cursorMainSpriteExtra.anchor.x = this._cursorMainSpriteExtra.anchor.y = 0.5;
        this._cursorMainSpriteExtra.y = this._cursor2Control.y;
        this._akeaCursors.addChild(this._cursorMainSpriteExtra);
    };
    Sprite_Battler.prototype.positionAkeaTargetsName = function () {
        if (this._battler.isEnemy()) {
            if (Akea.BattleSystem)
                this._akeaTargetName.x = -parseInt(Akea.AnimatedCursor.EnemyFont.x);
            else
                this._akeaTargetName.x = parseInt(Akea.AnimatedCursor.EnemyFont.x);
            this._akeaTargetName.y = -this.height + parseInt(Akea.AnimatedCursor.EnemyFont.y);
        } else {
            this._akeaTargetName.x = parseInt(Akea.AnimatedCursor.ActorFont.x);
            this._akeaTargetName.y = -this.height + parseInt(Akea.AnimatedCursor.ActorFont.y);
        }

    };

    Sprite_Battler.prototype.updateAkeaCursor = function () {
        if (this._battler.isSelected()) {
            this.positionAkeaTargetsName();
            this._akeaTargetName.opacity += 10;
            this._cursorMainSpriteExtra.anchor.y = (this.height) / this._cursorMainSpriteExtra.height;
            this._cursorMainSpriteMain.anchor.y = (this.height) / this._cursorMainSpriteMain.height;
            this._akeaCursors.y = -this.height / 2;
            this.updateAkeaMainCursor(this._cursorMainSpriteMain, this._cursor1Control);
            this.updateAkeaMainCursor(this._cursorMainSpriteExtra, this._cursor2Control);
            this.updateAkeaCursorRotation();
        } else {
            this._akeaTargetName.opacity -= 10;
            this.updateAkeaCursorReturnRotation();
        }
    };
    Sprite_Battler.prototype.updateAkeaCursorReturnRotation = function () {
        this._akeaCursors.opacity -= 10;
        if (this._battler.isEnemy() && !Akea.BattleSystem) {
            if (this._akeaCursors.rotation < Math.PI) {
                this._akeaCursors.rotation += 0.05;
            }
        }
        else {
            if (this._akeaCursors.rotation > -Math.PI) {
                this._akeaCursors.rotation -= 0.05;
            }
        }
    };
    Sprite_Battler.prototype.updateAkeaCursorRotation = function () {
        this._akeaCursors.opacity += 10;
        if (this._battler.isEnemy() && !Akea.BattleSystem) {
            if (this._akeaCursors.rotation > Math.PI * 1 / 4)
                this._akeaCursors.rotation += (Math.PI * 1 / 4 - this._akeaCursors.rotation) / 10;
        }
        else {
            if (this._akeaCursors.rotation < -Math.PI * 1 / 4)
                this._akeaCursors.rotation += (-Math.PI * 1 / 4 - this._akeaCursors.rotation) / 10;
        }
    };

    Sprite_Battler.prototype.updateAkeaMainCursor = function (sprite, controller) {
        if (controller.directionRotation) {
            sprite.scale.x -= controller.rotation;
            if (sprite.scale.x <= -1) {
                controller.directionRotation = false;
            }
        } else {
            sprite.scale.x += controller.rotation;
            if (sprite.scale.x >= 1) {
                controller.directionRotation = true;
            }
        }
        if (controller.directionUp) {
            sprite.y -= controller.motionSpeed;
            if (sprite.y <= controller.y - controller.maxMotion) {
                controller.directionUp = false;
            }
        } else {
            sprite.y += controller.motionSpeed;
            if (sprite.y >= controller.y + controller.maxMotion) {
                controller.directionUp = true;
            }
        }
    };
    const _Scene_Battle_startActorSelection = Scene_Battle.prototype.startActorSelection;
    Scene_Battle.prototype.startActorSelection = function () {
        this._actorWindow.selectSingle();
        _Scene_Battle_startActorSelection.call(this, ...arguments);
        if (!_Game_Action_needsSelection.call(BattleManager.inputtingAction()))
            this._actorWindow.selectAll();
    };

    const _Scene_Battle_startEnemySelection = Scene_Battle.prototype.startEnemySelection;
    Scene_Battle.prototype.startEnemySelection = function () {
        if (Akea.AnimatedCursor.DefaultWindow)
            _Scene_Battle_startEnemySelection.call(this, ...arguments);
        else {
            this._enemyWindow.refresh();
            this._enemyWindow.show();
            if (_Game_Action_needsSelection.call(BattleManager.inputtingAction())) {
                this._enemyWindow.selectSingle();
                this._enemyWindow.select(0);
            }
            this._enemyWindow.activate();
            if (!_Game_Action_needsSelection.call(BattleManager.inputtingAction())) {
                this._enemyWindow.selectAll();
                if (BattleManager.inputtingAction().isForEveryone())
                    $gameParty.selectAll()
            }

        }
    };
    const _Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
    Scene_Battle.prototype.onEnemyCancel = function () {
        this._actorWindow.hide();
        _Scene_Battle_onEnemyCancel.call(this, ...arguments);
    };

    const _Window_BattleEnemy_initialize = Window_BattleEnemy.prototype.initialize;
    Window_BattleEnemy.prototype.initialize = function (rect) {
        if (!Akea.AnimatedCursor.DefaultWindow)
            rect = new Rectangle(0, 0, 0, 0);
        _Window_BattleEnemy_initialize.call(this, rect);
    };

    const _Window_BattleActor_initialize = Window_BattleActor.prototype.initialize;
    Window_BattleActor.prototype.initialize = function (rect) {
        if (!Akea.AnimatedCursor.DefaultWindow)
            rect = new Rectangle(0, 0, 0, 0);
        _Window_BattleActor_initialize.call(this, rect);
    };
    const _Game_Action_needsSelection = Game_Action.prototype.needsSelection;
    Game_Action.prototype.needsSelection = function () {
        return this.checkItemScope([1, 2, 3, 4, 5, 7, 8, 9, 10, 6, 12, 13, 14]);
    };
    Game_Unit.prototype.selectAll = function () {
        for (const member of this.members()) {
            member.select();
        }
    };
    const _Window_BattleActor_select = Window_BattleActor.prototype.select;
    Window_BattleActor.prototype.select = function (index) {
        if (this._allSelection) { return };
        _Window_BattleActor_select.call(this, ...arguments);

    };
    Window_BattleActor.prototype.selectSingle = function () {
        this._allSelection = false;
    };
    Window_BattleActor.prototype.selectAll = function () {
        this._allSelection = true;
        $gameParty.selectAll();
    };
    const _Window_BattleEnemy_select = Window_BattleEnemy.prototype.select;
    Window_BattleEnemy.prototype.select = function (index) {
        if (this._allSelection) { return };
        _Window_BattleEnemy_select.call(this, ...arguments);
    };


    Window_BattleEnemy.prototype.selectSingle = function () {
        this._allSelection = false;
    };
    Window_BattleEnemy.prototype.selectAll = function () {
        this._allSelection = true;
        $gameTroop.selectAll();
    };
})();