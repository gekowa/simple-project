'use babel';

import projectService from '../lib/project-service';
import fs from "fs";

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
		// activationPromise = atom.packages.activatePackage('atom-project');

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

			projectService.save(projectFilePath);

			expect(fs.writeFileSync).toHaveBeenCalledWith(projectFilePath, serializedPaths);
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
		it("should load the paths to atom workspace", () => {
			spyOn(fs, "readFileSync").andReturn(serializedPaths);
			spyOn(atom, "open");

			projectService.load(projectFilePath);

			expect(atom.open).toHaveBeenCalledWith({
				pathsToOpen: paths,
				newWindow: true
			});
		});
	});
});
