export class UIManager {
    constructor() {
        this.screens = {};
        this.activeScreens = new Set();
        this.currentState = null;
    }

    registerScreen(name, { create, show = () => {}, hide = () => {}, update = () => {}, validStates = [] }) {

        console.log(name, "register")
        this.screens[name] = {
            initialized: false,
            container: null,
            create,
            show,
            hide,
            update,
            validStates
        };
    }

    onGameStateChange(newState) {
        this.currentState = newState;
        console.log("NEW STATE")
        for (const name in this.screens) {
            const screen = this.screens[name];
            const shouldBeVisible = screen.validStates.includes(newState);

            if (shouldBeVisible) {
                if (!screen.initialized) {
                    screen.container = screen.create();
                    screen.initialized = true;
                }

                screen.container.show();
                screen.show();
                this.activeScreens.add(name);
            } else if (screen.initialized) {
                screen.hide();
                screen.container.hide();
                this.activeScreens.delete(name);
            }
        }
    }

    hideAll() {
        for (const name of this.activeScreens) {
            this.hideScreen(name);
        }
        this.activeScreens.clear();
    }

    hideScreen(name) {
        const screen = this.screens[name];
        if (screen && screen.container) {
            screen.hide();
            screen.container.hide();
            this.activeScreens.delete(name);
        }
    }

    // 🔄 Add this: called from draw() or game loop
    updateAll() {
        for (const name of this.activeScreens) {
            const screen = this.screens[name];
            if (screen.update) {
                screen.update();
            }
        }
    }
}
