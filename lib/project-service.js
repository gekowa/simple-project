"use babel";

import fs from "fs";
import path from "path";

const projectService = {
	prepareProjectFileContent(projectPath) {
		const serializedProject = atom.project.serialize(),
			projectDirname = path.dirname(projectPath);

		// relativelize all paths
		return serializedProject.paths.map((folderPath) => path.relative(projectDirname, folderPath) );
	},

	save(projectFilePath) {
		const projectFileContent = this.prepareProjectFileContent(projectFilePath);
		fs.writeFileSync(projectFilePath, JSON.stringify(projectFileContent));
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
			pathsToOpen: projectPaths,
			newWindow: true
		});
	}
};

export default projectService;
