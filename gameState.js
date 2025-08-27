export class GameStateManager {
    constructor() {
        this.states = {};
        this.currentState = null;
        this.changeListeners = []; 
        this.prev = null
    }

    addState(name, { onEnter = () => {}, onExit = () => {} } = {}) {
        this.states[name] = { onEnter, onExit };
    }

    setState(newState) {
        //console.log(newState, "NEW STATE")
        if (!this.states[newState]) {
            console.warn(`State "${newState}" not defined`);
            return;
        }

        
        const oldState = this.currentState;
        if (oldState === newState) return;
        this.prev = oldState
        if (oldState && this.states[oldState].onExit) {
            this.states[oldState].onExit();
        }

        this.currentState = newState;

        if (this.states[newState].onEnter) {
            this.states[newState].onEnter();
        }

        // Trigger global listeners
        this.changeListeners.forEach((cb) => {
            cb(oldState, newState);
        });
    }

    getState() {
        return this.currentState;
    }

    is(state) {
        return this.currentState === state;
    }

    onChange(callback) {
        if (typeof callback === "function") {
            this.changeListeners.push(callback);
        }
    }

    clearChangeListeners() {
        this.changeListeners = [];
    }
}
