tabslideshow.xpi: chrome/tabslideshow.jar chrome.manifest defaults icon.png install.rdf
	zip -r tabslideshow.xpi chrome/ defaults/ chrome.manifest icon.png install.rdf

chrome/tabslideshow.jar: content
	@mkdir -p chrome
	zip -r chrome/tabslideshow.jar content

clean:
	@echo Removing build files ...
	@rm -Rvf chrome tabslideshow.xpi
