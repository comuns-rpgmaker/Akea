//==========================================================================
// Akea - Battle Camera
//----------------------------------------------------------------------------
// 02/08/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc Adds a camera to battle and allows to control it.
 * @author Gabe (Gabriel Nascimento)
 * @url http://patreon.com/gabriel_nfd
 * @base AkeaAnimatedBattleSystem
 * @orderAfter AkeaAnimatedBattleSystem
 * 
 * @help Akea - Battle Camera
 *  - This plugin is released under the zlib License.
 *  - This plugin requires the AkeaAnimatedBattleSystem base plugin.
 * 
 * This plugin adds a camera to battle and allows to control it during the 
 * skills.
 * 
 * Set the default camera position during actor and enemy selections through 
 * plugin parameters.
 * 
 * Next check out the skill notes available to control the camera during 
 * the skills. The parameters in brackets {param1, param2 ...} are 
 * optional, but must be entered without the brackets, as shown in the 
 * examples.
 * 
 * Skill Notes Tag:
 *   <akeaCameraOnUser {duration{,zoom}}>
 *       | Sets the camera for the skill user.
 *       | duration: the camera movement speed
 *       | zoom: the camera zoom scale
 * 
 *   <akeaCameraOnTarget id{,duration{,zoom}}>
 *       | Sets the camera for the id target.
 *       | id: the target id
 *       | duration: the camera movement speed
 *       | zoom: the camera zoom scale
 * 
 *   <akeaCameraAbsolute x,y,zoom,duration>
 *       | Sets the camera to the absolute coordinate.
 *       | x: the x coordinate
 *       | y: the y coordinate
 *       | zoom: the camera zoom scale
 *       | duration: the camera movement speed
 * 
 *   <akeaCameraZoom zoom{,duration}>
 *       | Sets the camera zoom scale at the current coordinate.
 *       | zoom: the camera zoom scale
 *       | duration: the camera movement speed
 * 
 *   <akeaCameraOffset x,y>
 *       | Sets the camera offset.
 *       | x: the x coordinate
 *       | y: the y coordinate
 * 
 *   <akeaCameraMode mode>
 *       | Sets the camera mode.
 *       | mode: the camera mode. 
 *       | - 0: Dynamic
 *       | - 1: Smoothing Start
 *       | - 2: Smoothing End
 *       | - 3: Full Smoothing
 * 
 *   <akeaCameraReset duration>
 *       | Resets all camera settings
 *       | duration: the camera movement speed
 * 
 * Usage Examples:
 *   <akeaCameraOnUser>
 *       | Focus the camera on the skill user.
 *   <akeaCameraOnUser 30,1.5>
 *       | Focus the camera on the skill user at speed 30 with 
 *       | a 1.5 zoom scale.
 * 
 *   <akeaCameraOnTarget 1>
 *       | Focus the camera on the id 1 target.
 *   <akeaCameraOnTarget 2,60,1.2>
 *       | Focus the camera on the id 2 target at speed 60 with 
 *       | a 1.2 zoom scale.
 * 
 *   <akeaCameraAbsolute 50,120,1,30>
 *       | Focus the camera on the 50 x 120 coordinates at speed 
 *       | 30 with a 1 zoom scale.
 * 
 *   <akeaCameraZoom 2>
 *       | Changes the camera zoom scale to 2
 *   <akeaCameraZoom 1.2,20>
 *       | Changes the camera zoom scale to 1.2 at speed 20.
 * 
 *   <akeaCameraOffset 0,48>
 *       | Sets the camera offset to 0 x 48
 * 
 *   <akeaCameraMode 1>
 *       | Change the camera mode to 1 (Smoothing Start)
 * 
 *   <akeaCameraReset 30>
 *       | Reset all camera changes at speed 30.
 * 
 * It may seem complex at first, but using and managing the camera 
 * is quite simple. Please just pay attention to the use of commas in 
 * the notes. The parameters must always be separated by commas, but 
without spaces between them. Look carefully at the examples provided 
 * to have a basis.
 * 
 * For support and new plugins join our Discord server: 
 * https://discord.gg/GG85QRz
 * 
 * @param defaultCameraMode
 * @text Default Camera Mode
 * @desc Set the default camera mode.
 * @type select
 * @option Dynamic
 * @value 0
 * @option Smoothing Start
 * @value 1
 * @option Smoothing End
 * @value 2
 * @option Full Smoothing
 * @value 3
 * @default 0
 * 
 * @param defaultSmoothExponent
 * @text Default Smooth Exponent
 * @desc Set the default camera smooth exponent when using the modes 1, 2 or 3.
 * @type number
 * @decimals 5
 * @min 0
 * @default 1.5
 * 
 * @param defaultActor
 * @text Default Actor Focus
 * @type struct<defaultFocus>
 * 
 * @param defaultEnemy
 * @text Default Enemy Focus
 * @type struct<defaultFocus>
 * 
 * @param resetCameraActionEnd
 * @text Reset Camera when Action End?
 * @desc Set true if you want the camera reset at the end of the actions.
 * @type boolean
 * @default false
 */

/*~struct~defaultFocus:
 * @param x
 * @text X
 * @desc  Set the X offset.
 * @type number
 * @min -1000
 * @default 0
 * 
 * @param y
 * @text Y
 * @desc  Set the Y offset.
 * @type number
 * @min -1000
 * @default 0
 * 
 * @param zoom
 * @text Zoom
 * @desc  Set the zoom scale.
 * @type number
 * @decimals 1
 * @min -1000
 * @default 1.4
 * 
 * @param duration
 * @text duration
 * @desc  Set the focus speed in frames
 * @type number
 * @min 0
 * @default 30
 */

var Akea                  = Akea || {};
Akea.BattleCamera         = Akea.BattleCamera || {};
Akea.BattleCamera.VERSION = [1, 0, 0];

if (!Akea.BattleSystem) throw new Error("AkeaBattleCamera plugin needs the AkeaAnimatedBattleSystem base.");

(() => {

    const pluginName = "AkeaBattleCamera";
    Akea.params = PluginManager.parameters(pluginName);

    Akea.BattleCamera.defaultCameraMode = parseInt(Akea.params.defaultCameraMode);
    Akea.BattleCamera.defaultSmoothExponent = parseFloat(Akea.params.defaultSmoothExponent);
    Akea.BattleCamera.defaultActor = {
        x: parseInt(JSON.parse(Akea.params.defaultActor).x), 
        y: parseInt(JSON.parse(Akea.params.defaultActor).y), 
        zoom: parseFloat(JSON.parse(Akea.params.defaultActor).zoom),
        duration: parseInt(JSON.parse(Akea.params.defaultActor).duration)};
    Akea.BattleCamera.defaultEnemy = {
        x: parseInt(JSON.parse(Akea.params.defaultEnemy).x), 
        y: parseInt(JSON.parse(Akea.params.defaultEnemy).y), 
        zoom: parseFloat(JSON.parse(Akea.params.defaultEnemy).zoom),
        duration: parseInt(JSON.parse(Akea.params.defaultEnemy).duration)};
    Akea.BattleCamera.resetCameraActionEnd = JSON.parse(Akea.params.resetCameraActionEnd);

    //-----------------------------------------------------------------------------
    // SceneManager
    //
    // The static class that manages scene transitions.

    SceneManager.battleCamera = function() {
        return this._scene.camera();
    }

    //-----------------------------------------------------------------------------
    // BattleManager
    //
    // The static class that manages battle progress.

    const _BattleManager_startActorInput = BattleManager.startActorInput;
    BattleManager.startActorInput = function() {
        _BattleManager_startActorInput.call(this);
        if (!this._currentActor) return;
        SceneManager.battleCamera().setOffset(Akea.BattleCamera.defaultActor.x,  Akea.BattleCamera.defaultActor.y);
        SceneManager.battleCamera().focusIn(this._currentActor, Akea.BattleCamera.defaultActor.zoom, Akea.BattleCamera.defaultActor.duration);
    };

    const _BattleManager_finishActorInput = BattleManager.finishActorInput;
    BattleManager.finishActorInput = function() {
        _BattleManager_finishActorInput.call(this);
        if (Akea.BattleCamera.resetCameraActionEnd) SceneManager.battleCamera().reset();
    };

    const _BattleManager_cancelActorInput = BattleManager.cancelActorInput;
    BattleManager.cancelActorInput = function() {
        _BattleManager_cancelActorInput.call(this);
        if (!this._currentActor) return;
        SceneManager.battleCamera().reset(Akea.BattleCamera.defaultActor.duration);
    };
    
    const _BattleManager_endBattlerActions = BattleManager.endBattlerActions;
    BattleManager.endBattlerActions = function(battler) {
        _BattleManager_endBattlerActions.call(this, battler);
        if (this._currentActor) {
            SceneManager.battleCamera().setOffset(Akea.BattleCamera.defaultActor.x,  Akea.BattleCamera.defaultActor.y);
            SceneManager.battleCamera().focusIn(this._currentActor, Akea.BattleCamera.defaultActor.zoom, Akea.BattleCamera.defaultActor.duration);
        } else {
            SceneManager.battleCamera().reset(Akea.BattleCamera.defaultActor.duration);
        }
    };

    //-----------------------------------------------------------------------------
    // Scene_Battle
    //
    // The scene class of the battle screen.

    const _Scene_Battle_create = Scene_Battle.prototype.create;
    Scene_Battle.prototype.create = function() {
        _Scene_Battle_create.call(this);
        this._camera = new Game_BattleCamera(this._spriteset);
    };

    const _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this._camera.update();
    };

    Scene_Battle.prototype.camera = function() {
        return this._camera;
    }

    const _Scene_Battle_startActorSelection = Scene_Battle.prototype.startActorSelection;
    Scene_Battle.prototype.startActorSelection = function() {
        _Scene_Battle_startActorSelection.call(this);
        this._actorWindow.focusInActor();
    };
    
    const _Scene_Battle_onActorOk = Scene_Battle.prototype.onActorOk;
    Scene_Battle.prototype.onActorOk = function() {
        _Scene_Battle_onActorOk.call(this);
    };
    
    const _Scene_Battle_onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function() {
        _Scene_Battle_onActorCancel.call(this);
        SceneManager.battleCamera().setOffset(Akea.BattleCamera.defaultActor.x,  Akea.BattleCamera.defaultActor.y);
        SceneManager.battleCamera().focusIn(this._actorCommandWindow.actor(), Akea.BattleCamera.defaultActor.zoom, Akea.BattleCamera.defaultActor.duration);
    };

    const _Scene_Battle_startEnemySelection = Scene_Battle.prototype.startEnemySelection;
    Scene_Battle.prototype.startEnemySelection = function() {
        _Scene_Battle_startEnemySelection.call(this);
        this._enemyWindow.focusInEnemy();
    };

    const _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
    Scene_Battle.prototype.onEnemyOk = function() {
        _Scene_Battle_onEnemyOk.call(this);
    };
    
    const _Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
    Scene_Battle.prototype.onEnemyCancel = function() {
        _Scene_Battle_onEnemyCancel.call(this);
        SceneManager.battleCamera().setOffset(Akea.BattleCamera.defaultActor.x,  Akea.BattleCamera.defaultActor.y);
        SceneManager.battleCamera().focusIn(this._actorCommandWindow.actor(), Akea.BattleCamera.defaultActor.zoom, Akea.BattleCamera.defaultActor.duration);
    };

    //-----------------------------------------------------------------------------
    // Window_BattleActor
    //
    // The window for selecting a target actor on the battle screen.

    const _Window_BattleActor_update = Window_BattleActor.prototype.update;
    Window_BattleActor.prototype.update = function() {
        _Window_BattleActor_update.call(this);
        if (!SceneManager.battleCamera()) return;
        if (this.index() != this._lastIndex && this.index() >= 0) {
            this._lastIndex = this.index();
            this.focusInActor();
        }
    };
    
    Window_BattleActor.prototype.focusInActor = function() {
        SceneManager.battleCamera().setOffset(Akea.BattleCamera.defaultActor.x,  Akea.BattleCamera.defaultActor.y);
        SceneManager.battleCamera().focusIn(this.actor(this.index()), Akea.BattleCamera.defaultActor.zoom, Akea.BattleCamera.defaultActor.duration);
    };

    //-----------------------------------------------------------------------------
    // Window_BattleEnemy
    //
    // The window for selecting a target enemy on the battle screen.

    const _Window_BattleEnemy_update = Window_BattleEnemy.prototype.update;
    Window_BattleEnemy.prototype.update = function() {
        _Window_BattleEnemy_update.call(this);
        if (!SceneManager.battleCamera()) return;
        if (this.index() != this._lastIndex && this.index() >= 0) {
            this._lastIndex = this.index();
            this.focusInEnemy();
        }
    };

    Window_BattleEnemy.prototype.focusInEnemy = function() {
        SceneManager.battleCamera().setOffset(Akea.BattleCamera.defaultEnemy.x,  Akea.BattleCamera.defaultEnemy.y);
        SceneManager.battleCamera().focusIn(this.enemy(), Akea.BattleCamera.defaultEnemy.zoom, Akea.BattleCamera.defaultEnemy.duration);
    };

    //-----------------------------------------------------------------------------
    // Game_BattlerCamera
    //
    // The game object class for battle camera.

    function Game_BattleCamera() {
        this.initialize(...arguments);
    }

    Game_BattleCamera.prototype.initialize = function(spriteset) {
        this._spriteset = spriteset;
        this.setup();
    };

    Game_BattleCamera.prototype.setup = function() {
        this._x = this._spriteset.x;
        this._y = this._spriteset.y;
        this._scaleX = this._spriteset.scale.x;
        this._scaleY = this._spriteset.scale.y;   
        this._offset = {x: 0, y: 0};
        this._cameraMode = Akea.BattleCamera.defaultCameraMode;
        this._smoothExponent = Akea.BattleCamera.defaultSmoothExponent;
    //  this._anchor = this._spriteset.children[0].pivot = new Point(0.5, 0.5);
    };

    Game_BattleCamera.prototype.setOffset = function(x, y) {
        this._offset = {x: x, y: y};
    };

    Game_BattleCamera.prototype.setCameraMode = function(mode) {
        this._cameraMode = mode;
    };

    Game_BattleCamera.prototype.focusIn = function(target, zoom, time) {
        target = this._spriteset.findTargetSprite(target);
        const scaleX = zoom || this._scaleX;
        const scaleY = zoom || this._scaleY;
        const x = (-((target.x + 96) * 0.5) + this._offset.x) * scaleX;
        const y = (-((target.y - 96) * 0.5) + this._offset.y) * scaleY;
        const duration = time || 1;
        this.move(x, y, scaleX, scaleY, duration);
    }

    Game_BattleCamera.prototype.zoom = function(zoom, duration) {
        const x = this._x;
        const y = this._y;
        const scaleX = zoom;
        const scaleY = zoom;
        this.move(x, y, scaleX, scaleY, duration);
    }

    Game_BattleCamera.prototype.reset = function(duration) {
        this._offset = {x: 0, y: 48};
        this._cameraMode = Akea.BattleCamera.defaultCameraMode;
        this.move(0, 0, 1, 1, duration);
    }

    Game_BattleCamera.prototype.move = function(x, y, scaleX, scaleY, duration) {
        this._targetX = x;
        this._targetY = y;
        this._targetScaleX = scaleX;
        this._targetScaleY = scaleY;
        this._duration = duration;
        this._wholeDuration = duration;
        this._cameraMode = 3;
        this._smoothExponent = 2;
    }

    Game_BattleCamera.prototype.update = function() {
        this.updateMove();
        this.updateSpriteset();
    };

    Game_BattleCamera.prototype.updateMove = function() {
        if (this._duration > 0) {
            this._x = this.applySmoothing(this._x, this._targetX);
            this._y = this.applySmoothing(this._y, this._targetY);
            this._scaleX = this.applySmoothing(this._scaleX, this._targetScaleX);
            this._scaleY = this.applySmoothing(this._scaleY, this._targetScaleY);
            this._duration--;
        }
    };
    
    Game_BattleCamera.prototype.updateSpriteset = function() {
        this._spriteset.children[0].x = this._x
        this._spriteset.children[0].y = this._y
        this._spriteset.children[0].scale.x = this._scaleX;
        this._spriteset.children[0].scale.y = this._scaleY;
    }

    Game_BattleCamera.prototype.applySmoothing = function(current, target) {
        const d = this._duration;
        const wd = this._wholeDuration;
        const lt = this.calcSmoothing((wd - d) / wd);
        const t = this.calcSmoothing((wd - d + 1) / wd);
        const start = (current - target * lt) / (1 - lt);
        return start + (target - start) * t;
    };

    Game_BattleCamera.prototype.calcSmoothing = function(t) {
        const exponent = this._smoothExponent;
        switch (this._cameraMode) {
            case 1: 
                return this.easeIn(t, exponent);
            case 2:
                return this.easeOut(t, exponent);
            case 3:
                return this.easeInOut(t, exponent);
            default:
                return t;
        }
    };

    Game_BattleCamera.prototype.easeIn = function(t, exponent) {
        return Math.pow(t, exponent);
    };
    
    Game_BattleCamera.prototype.easeOut = function(t, exponent) {
        return 1 - Math.pow(1 - t, exponent);
    };
    
    Game_BattleCamera.prototype.easeInOut = function(t, exponent) {
        if (t < 0.5) {
            return this.easeIn(t * 2, exponent) / 2;
        } else {
            return this.easeOut(t * 2 - 1, exponent) / 2 + 0.5;
        }
    };

    //-----------------------------------------------------------------------------
    // Game_Battler
    //
    // The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
    // and actions.

    const _Game_Battler_callAkeaActions = Game_Battler.prototype.callAkeaActions;
    Game_Battler.prototype.callAkeaActions = function (action, targets) {
        _Game_Battler_callAkeaActions.call(this, action, targets);
        switch (RegExp.$2) {
            case "CameraOnUser":
                this._akeaAnimatedBSActions.addAkeaCamera(RegExp.$3, targets, RegExp.$2, this, action);
                break;
            case "CameraOnTarget":
                this._akeaAnimatedBSActions.addAkeaCamera(RegExp.$3, targets, RegExp.$2, this, action);
                break;
            case "CameraAbsolute":
                this._akeaAnimatedBSActions.addAkeaCamera(RegExp.$3, targets, RegExp.$2, this, action);
                break;
            case "CameraZoom":
                this._akeaAnimatedBSActions.addAkeaCamera(RegExp.$3, targets, RegExp.$2, this, action);
                break;
            case "CameraOffset":
                this._akeaAnimatedBSActions.addAkeaCamera(RegExp.$3, targets, RegExp.$2, this, action);
                break;
            case "CameraMode":
                this._akeaAnimatedBSActions.addAkeaCamera(RegExp.$3, targets, RegExp.$2, this, action);
                break;
            case "CameraReset":
                this._akeaAnimatedBSActions.addAkeaCamera(RegExp.$3, targets, RegExp.$2, this, action);
                break;
        }
    }

    //-----------------------------------------------------------------------------
    // Game_Akea_Actions
    //
    // This class manages Akea Battle Actions

    Game_Akea_Actions.prototype.addAkeaCamera = function (id, targets, type, subject, moveAction) {
        let action = new Game_Akea_Action();
        action.setActionType(type);
        action.setId(id);
        action.setTargets(targets);
        action.setSubject(subject);
        action.setAction(moveAction);
        this.action = moveAction;
        this._actions.push(action);
    }

    //-----------------------------------------------------------------------------
    // Sprite_Battler
    //
    // The superclass of Sprite_Actor and Sprite_Enemy.

    const _Sprite_Battler_manageAkeaActions = Sprite_Battler.prototype.manageAkeaActions;
    Sprite_Battler.prototype.manageAkeaActions = function(action) {
        _Sprite_Battler_manageAkeaActions.call(this, action);
        let params;
        let zoom;
        let duration;
        switch (action.getActionType()) {
            case "CameraOnUser":
                params = action.getId().split(",");
                duration = parseInt(params[0]) || null;
                zoom = parseFloat(params[1]) || null;
                subject = action.getSubject();
                SceneManager.battleCamera().focusIn(subject, zoom, duration);
                break;
            case "CameraOnTarget":
                params = action.getId().split(",");
                id = parseInt(params[0]);
                if (!id) return;
                duration = parseInt(params[1]) || null;
                zoom = parseFloat(params[2]) || null;
                targets = action.getTargets();
                if (!targets[id - 1]) return;
                SceneManager.battleCamera().focusIn(targets[id - 1], zoom, duration);
                break;
            case "CameraAbsolute":
                params = action.getId().split(",");
                x = parseInt(params[0]);
                y = parseInt(params[1]);
                zoom = parseFloat(params[2]);
                duration = parseInt(params[3]);
                if (!x || !y || !zoom || !duration) return;
                SceneManager.battleCamera().move(x, y, zoom, duration);
                break;
            case "CameraZoom":
                params = action.getId()
                zoom = parseFloat(params[0])
                if (!zoom) return;
                duration = parseInt(params[1]) || 1;
                SceneManager.battleCamera().zoom(zoom, duration);
                break;
            case "CameraOffset":
                params = action.getId().split(",");
                x = parseInt(params[0]);
                y = parseInt(params[1]);
                if (!x || !y) return;
                SceneManager.battleCamera().setOffset(x, y);
                break;
            case "CameraMode":
                params = action.getId().split(",");
                mode = parseInt(params[0]);
                if (mode < 0 && mode > 3) return;
                SceneManager.battleCamera().setCameraMode(mode);
                break;
            case "CameraReset":
                params = action.getId().split(",");
                duration = parseInt(params[0]);
                if (!duration) return;
                SceneManager.battleCamera().reset(duration);
                break;
        }
    }

})();