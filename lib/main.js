"use babel";

import { CompositeDisposable } from "atom";
import { remote } from "electron";

import atomProjectService from "./project-service.js";

const PROJECT_FILE_FILTERS = [
	{name: 'Atom Project File', extensions: ['atom-project']},
	{name: 'All Files', extensions: ['*']}
];

const main = {
	openRecent(index) {
		return function() {
			const recentProjects = atomProjectService.getRecentProjects(),
				projectToOpen = recentProjects[index];
			if (projectToOpen) {
				atomProjectService.load(projectToOpen);
			}
		};
	},

	activate(state) {
		atomProjectService.restoreRecentProjects();

		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add("atom-workspace", {
			"simple-project:save-as": () => {
				remote.dialog.showSaveDialog(
					{
						title: "Save Project",
						defaultPath: atom.project.paths[0],
						filters: PROJECT_FILE_FILTERS
					},
					// callback
					(fileName) => {
						if (fileName === undefined) {
							// console.log("You didn't save the file.");
							return;
						}

						atomProjectService.save(fileName);

						// console.log(`Project file saved to ${fileName}.`);
					}
				);
			},
			"simple-project:open": () => {
				remote.dialog.showOpenDialog(
					{
						title: "Open Project",
						// defaultPath: should be last path
						filters: PROJECT_FILE_FILTERS,
						properties: ["openFile"]
					},
					// callback
					(fileName) => {
						if (fileName === undefined){
							// console.log("You have to choose a file to open.");
							return;
						}

						atomProjectService.load(fileName[0]);

						// console.log(`Project ${fileName} opened.`);
					}
				)
			},

			"simple-project:clear-recent": () => {
				atomProjectService.clearRecentProjects();
			}
		}));

		// let's bind recent commands
		let recentProjectCommandRegistry = {};
		for (let i = 0; i < atomProjectService.maxRecentProjects; i++) {
			const command = `simple-project:open-recent-${i}`;
			recentProjectCommandRegistry[command] = this.openRecent(i);
		}
		this.subscriptions.add(atom.commands.add("atom-workspace", recentProjectCommandRegistry));

		//TODO: adjust project menu position before Help or after Packages

		atomProjectService.renderRecentProjectMenuItems();
	},
};

export default main;
