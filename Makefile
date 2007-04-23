tabslideshow.xpi: chrome/tabslideshow.jar install.rdf
	zip -r tabslideshow.xpi chrome/ install.rdf
	
chrome/tabslideshow.jar: content
	@mkdir -p chrome
	zip -r chrome/tabslideshow.jar content -x \*/CVS/\* -x \*/.\*

clean:
	@echo Removing build files ...
	@rm -Rvf chrome tabslideshow.xpi
