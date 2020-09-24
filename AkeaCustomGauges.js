
//==========================================================================
// Akea Custom Gauges
//----------------------------------------------------------------------------
// 09/24/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc Akea Custom Gauges version: 1.0.0
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @orderAfter AkeaAnimatedBattleSystem
 * 
 * @help Akea Custom Gauges - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 

 * This plugin works as the following:
 * 
 * You will create in the parameters the gauges as asked, each gauge has a back image
 * and its bar image, you need to then set the x and y for them.
 * The type of gauge is where will that gauge scope be, if you choose battlerBase for example,
 * The gauge will act as when x and y are 0, on the base of the battler.
 * global is absolute values and hud is on the hud below, or on the custom hud if you are using any.
 * The maximum and variable gauge values are the only tricky part, that is needed 
 * a script call for each value, the max value would be when the bar is full, 
 * and the variable value is from 0 until max, the actual value for that gauge.
 * 
 * Examples:
 * For hp you would use:
 * | Maximum Gauge Value > this._battler.mhp
 * | Variable Gauge Value > this._battler.hp
 * 
 * For mp you would use:
 * | Maximum Gauge Value > this._battler.mmp
 * | Variable Gauge Value > this._battler.mp
 * 
 * For tp you would use:
 * | Maximum Gauge Value > 100
 * | Variable Gauge Value > this._battler.tp
 * 
 * For tpb (or atb) you would use:
 * | Maximum Gauge Value > 1
 * | Variable Gauge Value > this._battler.tpbChargeTime()
 * 
 * This gives you freedom for new and different ways to use your gauge! This means its very
 * easy to adjust a custom attribute also!
 * 
 * After you create your first gauge, you will need to append them to actors/enemies, this
 * can look like a bit of work, but this gives you much more freedom to customize your
 * gauges as you like for any actor/enemy!
 * 
 * 
 * 
 * 
 * @param actingGauge
 * @type boolean
 * @default true
 * @text Gauge Deactivation
 * @desc Deactivate Gauge when the battler is acting?
 * 
 * @param removeMenu
 * @type select[]
 * @option time
 * @option hp
 * @option mp
 * @option tp
 * @text Remove From Hud
 * @desc Deactivate what bars from the hud, if any?
 * 
 * @param actorConfig
 * @type struct<Actor>[]
 * @text Actor Configuration
 * @desc Configure here each actor with its extra gauges
 * 
 * @param enemyConfig
 * @type struct<Enemy>[]
 * @text Enemy Configuration
 * @desc Configure here each enemy with its extra gauges
 * 
 * @param gaugeConfig
 * @type struct<Gauge>[]
 * @text Gauge Configuration
 * @desc Configure here each gauge
 * 

*/
/*~struct~Actor:
 * @param id
 * @type actor
 * @text Actor
 * @param gauges
 * @type number[]
 * @text Gauges
 * @desc Gauges to append to this actor, just put the id of each gauge you want to add to that actor here
*/

/*~struct~Enemy:
 * @param id
 * @type enemy
 * @text Enemy
 * @param gauges
 * @type number[]
 * @text Gauges
 * @desc Gauges to append to this actor, just put the id of each gauge you want to add to that actor here
*/

/*~struct~Gauge:
 * @param gaugeBase
 * @type file
 * @dir img/akea/
 * @text Gauge Base Image
 * @desc Static image of the Gauge
 * @param baseX
 * @type number
 * @min -1000
 * @text Base X Position
 * @desc X Position for Gauge Base
 * @param baseY
 * @type number
 * @min -1000
 * @text Base Y Position
 * @desc Y Position for Gauge Base
 * @param gaugeBar
 * @type file
 * @dir img/akea/
 * @text Gauge Bar Image
 * @desc Image of the Gauge Bar
 * @param barX
 * @type number
 * @min -1000
 * @text Bar X Position
 * @desc X Position for Gauge Bar
 * @param barY
 * @type number
 * @min -1000
 * @text Bar Y Position
 * @desc Y Position for Gauge Bar
 * @param gaugeType
 * @type select
 * @option global
 * @option hud
 * @option battlerBase
 * @option battlerHead
 * @text Type of The Gauge
 * @desc if it should follow the battler(base or head), be absolute (global) or on the hud (actors only)
 * @param maximum
 * @type text
 * @default this._battler.mhp
 * @text Maximum Gauge Value
 * @desc The code that represents the maximum value, checkout the help for the most used ones.
 * @param variable
 * @type text
 * @default this._battler.hp
 * @text Variable Gauge Value
 * @desc The code that represents the variable value, checkout the help for the most used ones.
*/

// DON'T MODIFY THIS PART!!!
var Akea = Akea || {};
Akea.AnimatedGauges = Akea.AnimatedGauges || {};
Akea.AnimatedGauges.VERSION = [1, 0, 0];

ImageManager.loadAkea = function (filename) {
    return this.loadBitmap("img/akea/", filename);
};

(() => {
    const pluginName = "AkeaCustomGauges";
    const parameters = PluginManager.parameters(pluginName);
    let temp = JSON.parse(parameters.gaugeConfig);
    Akea.AnimatedGauges.GaugeConfig = [];
    Akea.AnimatedGauges.ActorConfig = [];
    Akea.AnimatedGauges.EnemyConfig = [];
    Akea.AnimatedGauges.DeactivateGauge = parameters.actingGauge == "true" ? true : false;
    Akea.AnimatedGauges.HudConfig = JSON.parse(parameters.removeMenu);
    let temp2;
    for (const gauge of temp) {
        temp2 = JSON.parse(gauge);
        temp2.baseX = parseInt(temp2.baseX);
        temp2.baseY = parseInt(temp2.baseY);
        temp2.barX = parseInt(temp2.barX);
        temp2.barY = parseInt(temp2.barY);
        Akea.AnimatedGauges.GaugeConfig.push(temp2);
    }
    temp = JSON.parse(parameters.actorConfig);
    for (const actor of temp) {
        temp2 = JSON.parse(actor);
        temp2.id = parseInt(temp2.id);
        temp2.gauges = JSON.parse(temp2.gauges).map(gauge => parseInt(gauge) - 1);
        Akea.AnimatedGauges.ActorConfig.push(temp2);
    }
    temp = JSON.parse(parameters.enemyConfig);
    for (const enemy of temp) {
        temp2 = JSON.parse(enemy);
        temp2.id = parseInt(temp2.id);
        temp2.gauges = JSON.parse(temp2.gauges).map(gauge => parseInt(gauge) - 1);
        Akea.AnimatedGauges.EnemyConfig.push(temp2);
    }
    temp = null;
    temp2 = null;
    const _Sprite_Battler_updateBitmap = Sprite_Battler.prototype.updateBitmap;
    Sprite_Battler.prototype.updateBitmap = function () {
        _Sprite_Battler_updateBitmap.call(this, ...arguments);
        const name = this._battler.battlerName();
        if (this._battlerName !== name) {
            this.createAkeaGauge();
        }
        this.updateAkeaGauge();
    };
    Sprite_Battler.prototype.createAkeaGauge = function () {
        this._mainAkeaGauge = new Sprite();
        this.addChild(this._mainAkeaGauge);
        this._gaugeBase = new Array();
        this._gaugeBars = new Array();
        this._gaugeInfos = new Array();
        this.createAkeaGaugeImages();
    };
    Sprite_Battler.prototype.createAkeaGaugeImages = function () {
        const battlerConfig = this.unloadBattlerGaugeConfig();
        const gauges = Akea.AnimatedGauges.GaugeConfig;
        let gauge;
        if (!battlerConfig) { return };
        for (let n = 0; n < battlerConfig.gauges.length; n++) {
            gauge = gauges[battlerConfig.gauges[n]];
            this._gaugeBase[n] = new Sprite();
            this._gaugeBase[n].bitmap = ImageManager.loadAkea(gauge.gaugeBase);
            this._gaugeBars[n] = new Sprite();
            this._gaugeBars[n].bitmap = ImageManager.loadAkea(gauge.gaugeBar);
            this.setAkeaGaugePositions(n, gauge);
            this._gaugeInfos[n] = {
                maximum: gauge.maximum,
                variable: gauge.variable,
                gaugeType: gauge.gaugeType,
                baseX: gauge.baseX,
                baseY: gauge.baseY
            };
        }
    };
    Sprite_Battler.prototype.setAkeaGaugePositions = function (n, gauge) {
        switch (gauge.gaugeType) {
            case "global":
                this._gaugeBase[n].x = gauge.baseX;
                this._gaugeBase[n].y = gauge.baseY;
                this._gaugeBars[n].x = gauge.barX;
                this._gaugeBars[n].y = gauge.barY;
                BattleManager._spriteset._battleField.addChild(this._gaugeBase[n]);
                BattleManager._spriteset._battleField.addChild(this._gaugeBars[n]);
                break;
            case "hud":
                this._gaugeBase[n].x = gauge.baseX;
                this._gaugeBase[n].y = gauge.baseY;
                this._gaugeBars[n].x = gauge.barX;
                this._gaugeBars[n].y = gauge.barY;
                SceneManager._scene._statusWindow.addAkeaGauge(this._battler, this._gaugeBase[n]);
                SceneManager._scene._statusWindow.addAkeaGauge(this._battler, this._gaugeBars[n]);
                break;
            case "battlerHead":
                this._gaugeBase[n].x = gauge.baseX;
                this._gaugeBase[n].y = gauge.baseY;
                this._gaugeBars[n].x = gauge.barX;
                this._gaugeBars[n].y = gauge.barY;
                this._mainAkeaGauge.addChild(this._gaugeBase[n]);
                this._mainAkeaGauge.addChild(this._gaugeBars[n]);
                this._needToUpdateHeight = true;
                break;
            case "battlerBase":
                this._gaugeBase[n].x = gauge.baseX;
                this._gaugeBase[n].y = gauge.baseY;
                this._gaugeBars[n].x = gauge.barX;
                this._gaugeBars[n].y = gauge.barY;
                this._mainAkeaGauge.addChild(this._gaugeBase[n]);
                this._mainAkeaGauge.addChild(this._gaugeBars[n]);
                break;
        }
    };

    Sprite_Battler.prototype.unloadBattlerGaugeConfig = function () {
        let config;
        if (this._battler.isActor()) {
            config = Akea.AnimatedGauges.ActorConfig.filter(battler => battler.id == this._battler.actorId());
        } else {
            config = Akea.AnimatedGauges.EnemyConfig.filter(battler => battler.id == this._battler.enemyId());
        }
        return config[0];
    };

    const _Sprite_Battler_updateFrame = Sprite_Battler.prototype.updateFrame;
    Sprite_Battler.prototype.updateFrame = function () {
        _Sprite_Battler_updateFrame.call(this, ...arguments);
        if (this._needToUpdateHeight && this.mainSprite().height != 0) {
            for (let n = 0; n < this._gaugeBars.length; n++) {
                if (this._gaugeInfos[n].gaugeType === "battlerHead") {
                    this._gaugeBase[n].y -= this.mainSprite().height;
                    this._gaugeBars[n].y -= this.mainSprite().height;
                }
            };
            this._needToUpdateHeight = false;
        }
    };

    Sprite_Battler.prototype.updateAkeaGauge = function () {
        for (let n = 0; n < this._gaugeBars.length; n++) {
            let variable = eval(this._gaugeInfos[n].variable);
            let max = eval(this._gaugeInfos[n].maximum);
            this._gaugeBars[n].scale.x = variable / max;
            if (Akea.AnimatedGauges.DeactivateGauge && this._battler.isActing() || (Akea.BattleSystem && this._battler.getAkeaAnimatedBSActions().hasActions())) {
                this._gaugeBars[n].opacity -= 25;
                this._gaugeBase[n].opacity -= 25;
            } else {
                this._gaugeBars[n].opacity += 25;
                this._gaugeBase[n].opacity += 25;
            }
        };
    };

    Window_BattleStatus.prototype.addAkeaGauge = function (actor, sprite) {
        const index = $gameParty.battleMembers().indexOf(actor);
        const rect = this.itemRect(index);
        const x = rect.x;
        const y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        sprite.x += x;
        sprite.y += y;
        this.addInnerChild(sprite);
    };

    const _Window_StatusBase_placeGauge = Window_StatusBase.prototype.placeGauge;
    Window_StatusBase.prototype.placeGauge = function (actor, type, x, y) {
        if (Akea.AnimatedGauges.HudConfig.includes(type)) { return };
        _Window_StatusBase_placeGauge.call(this, ...arguments);
    };

})();