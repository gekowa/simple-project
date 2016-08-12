"use babel";

import { CompositeDisposable } from "atom";
import _ from "lodash";
import { remote } from "electron";
import atomProjectService from "./project-service.js";

const PROJECT_FILE_FILTERS = [
	{name: 'Atom Project File', extensions: ['atom-project']},
	{name: 'All Files', extensions: ['*']}
];

const main = {
	findProjectMenu() {
		return _.find(atom.menu.template, (m) => { return m.label === "Project"; });
	},

	// addOpenProjectMenuItemAfterOpenFolder(menu) {
	// 	console.log(menu);
	//
	// 	let submenu = menu.submenu,
	// 	indexOfOpenFolder = _.findIndex(submenu, (m) => { return m.command === "application:open-folder"; });
	//
	// 	menu.submenu = [
	// 		...submenu.slice(0, indexOfOpenFolder + 1),
	// 		{
	// 			command: "atom-project:open-project-dialog",
	// 			label: "Open Project…"
	// 		},
	// 		...submenu.slice(indexOfOpenFolder + 1)
	// 	];
	// },

	// relocateProjectMenu() {
	// 	const projectMenu = this.findProjectMenu();
	//
	// 	atom.menu.update();
	// },

	activate(state) {
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();

		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add("atom-workspace", {
			"atom-project:save": () => {
				console.log("Saving project file...");

				remote.dialog.showSaveDialog(
					{
						title: "Save Project",
						defaultPath: atom.project.paths[0],
						filters: PROJECT_FILE_FILTERS
					},
					// callback
					(fileName) => {
						if (fileName === undefined){
							console.log("You didn't save the file.");
							return;
						}

						atomProjectService.save(fileName);

						console.log(`Project file saved to ${fileName}.`);
					}
				);
			},
			"atom-project:open": () => {
				remote.dialog.showOpenDialog(
					{
						title: "Open Project",
						// defaultPath: should be last path
						filters: PROJECT_FILE_FILTERS,
						properties: ["openFile", ]
					},
					// callback
					(fileName) => {
						if (fileName === undefined){
							console.log("You have to choose a file to open.");
							return;
						}

						atomProjectService.load(fileName[0]);

						console.log(`Project ${fileName} opened.`);
					}
				)
			}
		}));

		//TODO: adjust project menu position
	}
};

export default main;
