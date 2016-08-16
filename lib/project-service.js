"use babel";

import fs from "fs";
import path from "path";
import _ from "lodash";

const MAX_RECENT_PROJECTS = 10;
const RECENT_PROJECT_STORAGE_KEY = "simple-project:recent-projects";
let recentProjects = [];

const projectService = {
	maxRecentProjects: MAX_RECENT_PROJECTS,

	prepareProjectFileContent(projectPath) {
		const serializedProject = atom.project.serialize(),
			projectDirname = path.dirname(projectPath);

		// relativelize all paths
		return serializedProject.paths.map((folderPath) => path.relative(projectDirname, folderPath) );
	},

	save(projectFilePath) {
		const projectFileContent = this.prepareProjectFileContent(projectFilePath);
		fs.writeFileSync(projectFilePath, JSON.stringify(projectFileContent));

		this.saveRecentProject(projectFilePath);
	},

	loadFileAndPreparePaths(projectFilePath) {
		const fileContent = fs.readFileSync(projectFilePath),
			projectDirname = path.dirname(projectFilePath);

		//TODO: check file integrity
		let projectPaths = JSON.parse(fileContent);

		// absolutive paths
		return projectPaths.map((folderPath) => {
			if (path.isAbsolute(folderPath)) {
				return folderPath;
			} else {
				return path.normalize(path.join(projectDirname, folderPath));
			}
		});
	},

	load(projectFilePath) {
		const projectPaths = this.loadFileAndPreparePaths(projectFilePath);

		atom.open({
			devMode: atom.devMode,
			pathsToOpen: projectPaths,
			newWindow: true
		});

		this.saveRecentProject(projectFilePath);
	},

	findMenuByLabel(menu, label) {
		if (arguments.length === 1) {
			label = menu;
			menu = null;
		}
		// Menu.getApplicationMenu().items
		return _.find(menu || atom.menu.template, (m) => { return m.label === label; });
	},

	saveRecentProject(projectFilePath) {
		const index = _.indexOf(recentProjects, projectFilePath);
		// not exist
		if (index < 0) {
			recentProjects.push(projectFilePath);
		} else {
			//TODO: adjust order
			recentProjects = [
				recentProjects[index],
				...recentProjects.slice(0, index),
				...recentProjects.slice(index + 1),
			];
		}

		localStorage.setItem(RECENT_PROJECT_STORAGE_KEY, JSON.stringify(recentProjects));
		this.renderRecentProjectMenuItems();
	},

	getRecentProjects() {
		return _.takeRight(recentProjects, MAX_RECENT_PROJECTS);
	},

	clearRecentProjects() {
		recentProjects = [];

		localStorage.removeItem(RECENT_PROJECT_STORAGE_KEY);

		this.renderRecentProjectMenuItems();
	},

	/**
	 * Loads array of recent projects from local storage
	 * @return {[type]} [description]
	 */
	restoreRecentProjects() {
		const recentProjectJSON = localStorage.getItem(RECENT_PROJECT_STORAGE_KEY);
		if (recentProjectJSON) {
			recentProjects = _.takeRight(JSON.parse(recentProjectJSON), MAX_RECENT_PROJECTS);
		}

		this.renderRecentProjectMenuItems();
	},

	renderRecentProjectMenuItems() {
		const clearRecentProjectsMenuItem = {
				"label": "Clear Recent Projects",
				"command": "simple-project:clear-recent"
			},
			recentProjects = this.getRecentProjects();

		// find Project Menu
		const projectMenu = this.findMenuByLabel("Project");

		if (!projectMenu) {
			// do nothing
			return;
		}

		const recentProjectMenu = this.findMenuByLabel(projectMenu.submenu, "Recent Projects");
		if (!recentProjectMenu) {
			// also do nothing
			return;
		}

		// if there's any
		if (recentProjects.length > 0) {
			const recentProjectMenuItems = recentProjects.map((project, index) => {
				return {
					"label": `${index + 1}: ${project}`,
					"command": `simple-project:open-recent-${index}`,
				}
			});

			recentProjectMenu.submenu = [
				...recentProjectMenuItems,
				{
					"type": "separator"
				},
				clearRecentProjectsMenuItem
			]
		} else {
			recentProjectMenu.submenu = [
				Object.assign(clearRecentProjectsMenuItem, {
					enabled: false
				})
			]
		}

		atom.menu.update();
	},
};

export default projectService;
