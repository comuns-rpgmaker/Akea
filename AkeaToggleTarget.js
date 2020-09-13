//==========================================================================
// Akea Toggle Targets
//----------------------------------------------------------------------------
// 09/13/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc Akea Toggle Targets version: 1.0.0
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @base AkeaAnimatedCursor
 * @orderAfter AkeaAnimatedCursor
 * @help Akea Toggle Targets - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 
 * To configure this plugin, enter in the parameters the skill id you want to be toggled
 * After the Skill id just choose the types of toggles it has and if the damage should be
 * divided among the targets.
 * 
 * You can toggle the target

 * @param toggleSkills
 * @type struct<Skill>[]
 * @text Togglable Skills
 * @desc Choose here which skills will be able to toggle or not.
*/
/*~struct~Skill:
 * @param skillId
 * @type number
 * @text Skill Id
 * @desc Skill Id to enable Toggle
 * @param damageDivide
 * @type boolean
 * @text Divide Damage
 * @default true
 * @desc If the damage should be divided when the target is toggled
 * @param scopes
 * @type select[]
 * @option One Enemy
 * @option All Enemies
 * @option One Ally
 * @option All Allies
 * @option Everyone
 * @text Skill Scopes
 * @desc Choose which scopes you want to add for this skill
*/

// DON'T MODIFY THIS PART!!!
var Akea = Akea || {};
Akea.ToggleTargets = Akea.ToggleTargets || {};
Akea.ToggleTargets.VERSION = [1, 0, 0];

(() => {
    const pluginName = "AkeaToggleTargets";
    const parameters = PluginManager.parameters(pluginName);
    Akea.ToggleTargets.skills = [];
    Akea.ToggleTargets.damageDividing = [];
    Akea.ToggleTargets.toggleSkills = JSON.parse(parameters.toggleSkills);
    for (const param of Akea.ToggleTargets.toggleSkills) {
        let toggle = JSON.parse(param);
        Akea.ToggleTargets.skills[parseInt(toggle.skillId)] = [];
        if (toggle.damageDivide == "true")
            Akea.ToggleTargets.damageDividing.push(parseInt(toggle.skillId))
        for (const scope of JSON.parse(toggle.scopes)) {
            if (scope == "One Enemy")
                Akea.ToggleTargets.skills[parseInt(toggle.skillId)].push(1)
            if (scope == "All Enemies")
                Akea.ToggleTargets.skills[parseInt(toggle.skillId)].push(2)
            if (scope == "One Ally")
                Akea.ToggleTargets.skills[parseInt(toggle.skillId)].push(7)
            if (scope == "All Allies")
                Akea.ToggleTargets.skills[parseInt(toggle.skillId)].push(8)
            if (scope == "Everyone")
                Akea.ToggleTargets.skills[parseInt(toggle.skillId)].push(14)
        }
    }
    const _Scene_Battle_create = Scene_Battle.prototype.create;
    Scene_Battle.prototype.create = function () {
        _Scene_Battle_create.call(this, ...arguments);
        this.createPageButtons()
    };

    Scene_Battle.prototype.createPageButtons = function () {
        this._pageupButton = new Sprite_Button("pageup");
        this._pageupButton.x = 4;
        this._pageupButton.y = this.buttonY();
        const pageupRight = this._pageupButton.x + this._pageupButton.width;
        this._pagedownButton = new Sprite_Button("pagedown");
        this._pagedownButton.x = pageupRight + 4;
        this._pagedownButton.y = this.buttonY();
        this.addWindow(this._pageupButton);
        this.addWindow(this._pagedownButton);
        this._pageupButton.visible = false;
        this._pagedownButton.visible = false;
    };
    const _Scene_Battle_updateInputWindowVisibility = Scene_Battle.prototype.updateInputWindowVisibility;
    Scene_Battle.prototype.updateInputWindowVisibility = function () {
        _Scene_Battle_updateInputWindowVisibility.call(this, ...arguments);
        if (this._actorWindow.active || this._enemyWindow.active) {
            const id = BattleManager.inputtingAction().item().id;
            if (BattleManager.inputtingAction().isSkill() && Akea.ToggleTargets.skills[id]) {
                this._pageupButton.visible = true;
                this._pagedownButton.visible = true;
            }
            const threshold = 20;
            if (Input.isTriggered("pageup") || TouchInput.wheelY >= threshold)
                this.rotateAkeaScope(true);
            else if (Input.isTriggered("pagedown") || TouchInput.wheelY <= -threshold)
                this.rotateAkeaScope(false);
        } else {
            this._pageupButton.visible = false;
            this._pagedownButton.visible = false;
        }
    };
    Scene_Battle.prototype.rotateAkeaScope = function (rotatingUp) {
        const id = BattleManager.inputtingAction().item().id;
        const scope = BattleManager.inputtingAction().item().scope;
        if (BattleManager.inputtingAction().isSkill() && Akea.ToggleTargets.skills[id]) {
            if (!Akea.ToggleTargets.skills[id].includes(scope)) {
                Akea.ToggleTargets.skills[id].push(scope)
            }
            BattleManager.inputtingAction().item().scope = this.getScopeAkea(BattleManager.inputtingAction().item().scope, Akea.ToggleTargets.skills[id], rotatingUp);
            this._enemyWindow.deactivate();
            this._enemyWindow.hide();
            this._actorWindow.deactivate();
            this._actorWindow.hide();
            this.onSelectAction();
        }
    };
    Scene_Battle.prototype.getScopeAkea = function (scope, skillArray, rotatingUp) {
        const index = skillArray.indexOf(scope);
        if (rotatingUp)
            if (index === skillArray.length - 1) {
                return skillArray[0];
            } else {
                return skillArray[index + 1];
            }
        else
            if (index === 0) {
                return skillArray[skillArray.length - 1];
            } else {
                return skillArray[index - 1];
            }
    };

    const _Game_Action_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
    Game_Action.prototype.evalDamageFormula = function (target) {
        let damage = _Game_Action_evalDamageFormula.call(this, ...arguments);
        if (this.isSkill() && Akea.ToggleTargets.skills[this.item().id]) {
            if (this.makeTargets().length > 0) {
                if (Akea.ToggleTargets.damageDividing.includes(this.item().id))
                    damage /= this.makeTargets().length;
            }
        }
        return damage;
    };
})();
