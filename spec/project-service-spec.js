'use babel';

import projectService from '../lib/project-service';
import fs from "fs";
import _ from "lodash";

describe('AtomProject', () => {
	const paths = [
		"C:\\Workspace\\ProjectA\\folder1",
		"C:\\Workspace\\folder2\\folder3",
		"D:\\folder4"
	],
		projectFilePath = "C:\\Workspace\\ProjectA\\myproject.atom-project",
		relativePaths = [
			"folder1",
			"..\\folder2\\folder3",
			"D:\\folder4"
		],
		serializedPaths = '["folder1","..\\\\folder2\\\\folder3","D:\\\\folder4"]';

	beforeEach(() => {
		// workspaceElement = atom.views.getView(atom.workspace);
		// activationPromise = atom.packages.activatePackage('simple-project');
	});

	describe("Prepare project file content", () => {
		it("should relativelize all paths to the project file directory", () => {
			spyOn(atom.project, "serialize").andReturn({
				paths: paths
			});

			const result = projectService.prepareProjectFileContent(projectFilePath);

			expect(result).toEqual(relativePaths);
		});
	});

	describe("Save project to file", () => {
		it("should save the file properly", () => {
			spyOn(atom.project, "serialize").andReturn({
				paths: paths
			});

			spyOn(fs, "writeFileSync");
			spyOn(projectService, "saveRecentProject");

			projectService.save(projectFilePath);

			expect(fs.writeFileSync).toHaveBeenCalledWith(projectFilePath, serializedPaths);
			expect(projectService.saveRecentProject).toHaveBeenCalledWith(projectFilePath);
		});
	});

	describe("Load project file and prepare paths", () => {
		it("should load file successfully and prepare the paths", () => {
			spyOn(fs, "readFileSync").andReturn(serializedPaths);

			const result = projectService.loadFileAndPreparePaths(projectFilePath);

			expect(result).toEqual(paths);
		});
	});

	describe("Open project file", () => {
		beforeEach(() => {
			spyOn(fs, "readFileSync").andReturn(serializedPaths);
			spyOn(atom, "open");
		});
		it("should load the paths to atom workspace", () => {
			spyOn(projectService, "saveRecentProject");

			projectService.load(projectFilePath);

			expect(atom.open).toHaveBeenCalledWith({
				devMode: atom.devMode,
				pathsToOpen: paths,
				newWindow: true
			});

			expect(projectService.saveRecentProject).toHaveBeenCalledWith(projectFilePath);
		});
	});

	describe("Save recent open or saved project", () => {
		beforeEach(() => {
			projectService.clearRecentProjects();

			spyOn(projectService, "renderRecentProjectMenuItems");
		});

		it("should save recent project when available", () => {
			const projectPath = "C:\\Workspace\\ProjectA";

			projectService.saveRecentProject(projectPath);
			const result = projectService.getRecentProjects();

			expect(_.indexOf(result, projectPath) >= 0).toBe(true);
		});

		it("should remove the oldest one when more than 10 recent projects", () => {
			const projectPath = "C:\\Workspace\\ProjectA",
				lastProject = projectPath + "any";

			for (let i = 0; i < 10; i++) {
				projectService.saveRecentProject(projectPath + i);
			}

			projectService.saveRecentProject(lastProject);

			const result = projectService.getRecentProjects();

			expect(result.length).toBe(10);
			expect(result[result.length - 1]).toBe(lastProject);
			expect(result[result.length - 10]).toBe(projectPath + "1");
		});

		it("should only save same project once", () => {
			const projectPath = "C:\\Workspace\\ProjectA";

			// save twice
			projectService.saveRecentProject(projectPath);
			projectService.saveRecentProject(projectPath);

			const result = projectService.getRecentProjects();

			expect(result.length).toBe(1);
		});

		it("should render the recent project menu", () => {
			const projectPath = "C:\\Workspace\\ProjectA";

			projectService.saveRecentProject(projectPath);

			expect(projectService.renderRecentProjectMenuItems).toHaveBeenCalled();
		});

		it("should bumped just opened project to top", () => {
			const projectPath = "C:\\Workspace\\ProjectA";

			for (let i = 0; i < 5; i++) {
				projectService.saveRecentProject(projectPath + i);
			}

			projectService.saveRecentProject(projectPath + 2);

			const result = projectService.getRecentProjects();

			expect(_.indexOf(result, projectPath + 2)).toBe(0);
		});
	});

	describe("When clear recent projects", () => {
		it("should clear recnet projects", () => {
			projectService.saveRecentProject("AnyProject");

			projectService.clearRecentProjects();

			expect(projectService.getRecentProjects().length).toBe(0);
		});

		it("should render the recent project menu", () => {
			const projectPath = "C:\\Workspace\\ProjectA";

			spyOn(projectService, "renderRecentProjectMenuItems");

			projectService.saveRecentProject(projectPath);

			expect(projectService.renderRecentProjectMenuItems).toHaveBeenCalled();
		});
	});
});
