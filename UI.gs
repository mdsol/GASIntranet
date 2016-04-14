//======================= End of variables for basic authentication ======================================

//============================================= Database     =============================================
var CLOUDSQL_INSTANCE = "acme.com:GoogleSitesdb:GoogleSitessql";
var CLOUDSQL_DATABASE = "mycloudsqldb";

var page_summaries_table   = "page_summaries";
var jive_page_export_table = "jive_page_export";
var jive_places_table      = "jive_places";
//=================== END Database =======================================================================

var today        = new Date();
var timestamp    = Utilities.formatDate(today, "GMT", "yyyymdHHMMSS");
var creationdate = Utilities.formatDate(today, "GMT", "dd-MMM-yyyy");
var currentuser  = Session.getActiveUser().getEmail();

//============================================= Database =================================================
var default_gs_source_url   = "https://sites.google.com/a/acme.com/intranet/home/it/it-announcements/";
var default_jive_source_url = "https://acme.jiveon.com/groups/sandbox";
var default_find_string     = "GoogleSites";
var default_replace_string  = "acmecorp newsnet";
var default_tags            = "GoogleSites imported, draft";
//=================== END Database =======================================================================

function doGet(e)
{  
  //Title of App.
  var app = UiApp.createApplication().setTitle('Migrate Google Sites to JIVE');
  var pageTagButton = app.createButton("Copy Page").setId("copyBtn");
  
  var resetButton = app.createButton("Reset").setId("Reset");
  
  var clickMeHyperLink = app.createAnchor('','').setId("clickMeHyperLink").setText("");
  clickMeHyperLink.setHref("https://sites.google.com/a/acme.com/legacywiki/temp/test1");
  
  // function that handles the actions
  var submitHandler            = app.createServerClickHandler('copysinglepage');
  var submitHandler2           = app.createServerClickHandler('resetform');
  var mouseDownhandler         = app.createServerClickHandler("mouseDownHandler");
  var radioButtonHandler1      = app.createServerClickHandler('settopages');
  var radioButtonHandler2      = app.createServerClickHandler('settopage');
  
  pageTagButton.addMouseDownHandler(mouseDownhandler);

  var reRirectCheckBox   = app.createCheckBox("Change old page into redirect page").setName('redirecttrue');
  var sourceJiveCheckBox = app.createCheckBox("Add GS source in Jive").setName('sourcejivetrue');
  
  
  //var linksContainer = app.createLabel().setId("linksContainer");
  var htmlContainerLabel= app.createFlowPanel().setId("htmlContainerLabel");
  //  var htmlContainer= app.createScrollPanel().setPixelSize(100, 100).setId("htmlContainer");
  
  var htmlContainer= app.createTextArea().setId('htmlContainer').setPixelSize(680, 233)
  
  var checkPageContainer= app.createFlowPanel().setId("checkPageContainer").setStyleAttribute("padding-top", "10px").setStyleAttribute("padding-bottom", "20px");
  
  pageTagButton.setPixelSize(230, 44);
  pageTagButton.setStyleAttribute("color", "#fe5f10");
  pageTagButton.setStyleAttribute("font-size", 14).setStyleAttribute("font-weight", "bold");
  
  resetButton.setPixelSize(70, 44);
  
  resetButton.setStyleAttribute("color", "#fe5f10");
  resetButton.setStyleAttribute("font-size", 14).setStyleAttribute("" + "font-weight", "bold");
  
  
  var simple = app.createSimplePanel();
  var flow = app.createFlowPanel();
  flow.add(app.createLabel('This widget will let you copy the html source of one page into JIVE newsnet enviroment, with an option to replace some text...')
           .setStyleAttribute("font-size", "14").setStyleAttribute("font-weight", "bold").setStyleAttribute("padding-top", "20px").setStyleAttribute("padding-bottom", "20px"));
  simple.add(flow);
  app.add(simple);
  
  //add radio buttons
  var radioPanel = app.createHorizontalPanel();
  var underRadioPanel = app.createHorizontalPanel();
  var radioLabel = app.createLabel('Do you want to copy subpages too? ');
  var radio1 = app.createRadioButton('subpagesBox', 'Yes').setId("radYes");
  var radio2 = app.createRadioButton('subpagesBox', 'No').setId("radNo").setValue(true);
  radioPanel.add(radioLabel).add(radio1).add(radio2);
  
  radio1.addMouseDownHandler(radioButtonHandler1);
  radio2.addMouseDownHandler(radioButtonHandler2);
  
  
  var errorText = app.createLabel('').setId("errorText").setStyleAttribute("color", "#ff0000");  
  
  //create grid to hold form
  var grid = app.createGrid(20, 3);
  
  grid.setWidget(0, 0, app.createLabel('URL of page to copy (Google Sites): '));
  grid.setWidget(1, 0, app.createTextBox().setName('sourceURL').setId('sourceURL').setPixelSize(600, 25).setText(default_gs_source_url));
  grid.setWidget(2, 0, app.createLabel('URL of new location (JIVE space URL): ').setId('destLabel'));
  grid.setWidget(3, 0, app.createTextBox().setName('targetURL').setId('targetURL').setPixelSize(600, 25).setText(default_jive_source_url));
  grid.setWidget(4, 0, underRadioPanel);  
  
  grid.setWidget(5, 0, app.createLabel('Replace String: '));
  grid.setWidget(6, 0, app.createTextBox().setName('findString').setId('findString').setPixelSize(200, 25).setText(default_find_string));
  grid.setWidget(7, 0, app.createLabel('With: '));
  grid.setWidget(8, 0, app.createTextBox().setName('replaceString').setId('replaceString').setPixelSize(200, 25).setText(default_replace_string));
 
  grid.setWidget(7, 1, app.createLabel('Tags (Comma sperated)'));
  grid.setWidget(8, 1, app.createTextBox().setName('tags').setId('tags').setPixelSize(200, 25).setText(default_tags));
  grid.setWidget(9, 0, radioPanel);
  grid.setWidget(10, 0, pageTagButton);
  grid.setWidget(11, 1, resetButton);
  grid.setWidget(12, 0, reRirectCheckBox); 
  grid.setWidget(13, 0, sourceJiveCheckBox);
  
  grid.setWidget(14, 0, errorText);
  grid.setWidget(15, 0, clickMeHyperLink);
  grid.setWidget(16, 0, htmlContainerLabel);
  grid.setWidget(17, 0, app.createLabel('Logger: '));
  grid.setWidget(18, 0, htmlContainer);
  grid.setWidget(19, 0, checkPageContainer);
  
  app.add(grid);
  
  submitHandler.addCallbackElement(grid);
  submitHandler2.addCallbackElement(grid);
  
  pageTagButton.addClickHandler(submitHandler);
  resetButton.addClickHandler(submitHandler2);
  
  return app;
}

function resetform(e)
{  
  var app = UiApp.getActiveApplication();
  app.getElementById("copyBtn").setText("Copy Page");
  app.getElementById("sourceURL").setText(default_gs_source_url);
  app.getElementById("targetURL").setText(default_jive_source_url);
  app.getElementById("findString").setText(default_find_string);
  app.getElementById("replaceString").setText(default_replace_string);
  app.getElementById("copyBtn").setEnabled(true);
  app.getElementById("radNo").setValue(true);
  app.getElementById("htmlContainer").setText("");
  app.getElementById("tags").setText(default_tags);
  app.getElementById("errorText").setText("");
  
  var radio2 = app.createRadioButton('subpagesBox', 'No').setValue(true);
  app.getElementById("clickMeHyperLink").setText("");
  return app;
}

function copysinglepage(e)
{
  var basicAuth = 'newsnet@acme.com:yourpassword';
  var dsn       = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn      = Jdbc.getCloudSqlConnection(dsn);
  var stmt      = conn.createStatement();
  var stmt1     = conn.createStatement();
  
  var app                  = UiApp.getActiveApplication();
  var logger_text          = '';
  var original_page_status = '';
  var data;
  var query;
  
  //Gadget's input parameters
  var sourcepage           = e.parameter.sourceURL;   
  var newpagelocation_jive = e.parameter.targetURL;
  var findString           = e.parameter.findString;    
  var replaceString        = e.parameter.replaceString;
  var radio                = e.parameter.subpagesBox;
  var redirectpage         = e.parameter.redirecttrue;
  var sourcejivetrue       = e.parameter.sourcejivetrue;
  var tags                 = e.parameter.tags;
  
  try {
    var page = SitesApp.getPageByUrl(sourcepage);
  } catch(err) {
    if(radio == "true") {
      if(sourcepage.slice(-1) != '/') sourcepage += '/';
        sourcepage += 'home';
    }
  }
  
  try {
    //check if page was indexed
    var isIndexed = checkIndexedPage(sourcepage);
    if(isIndexed == false) {
      if(page !== null) {
        logger_text += 'This page was not indexed in database: \n';
        logger_text += sourcepage+ '\n';
        logger_text += '---\n';
      } else {
        logger_text += 'This page does not exist: \n';
        logger_text += sourcepage+ '\n';
        logger_text += '---\n';
      }
    }
    //check if GS url has special characters
    if(sourcepage.indexOf("%E2%80%") > 0) {
      statusInJive(sourcepage, '0', 'bad_url', basicAuth);
      app.getElementById("htmlContainer").setText('This was saved as bad_url because of a special character from url: ' + sourcepage + '\n');
      app.getElementById("copyBtn").setText("Copy complete");
      app.getElementById("copyBtn").setEnabled(true);
      return app;
    }
    // check if JIVE space is a personal blog
    var new_blog_place_id = checkIfPersonalBlog(newpagelocation_jive, basicAuth);
    var new_place_id = "";
    if(new_blog_place_id == 0) {
      // check if it's another place beside a personal blog
      new_place_id = getSpaceIdByUrl(newpagelocation_jive, basicAuth);
      if(new_place_id == 0) {
        app.getElementById("htmlContainer").setText('This JIVE place doesn\'t not exists. Please corect it!');
        app.getElementById("copyBtn").setText("Change JIVE location url");
        app.getElementById("copyBtn").setEnabled(true);
        return app;
      }
      new_blog_place_id = getSpaceIdByUrl(newpagelocation_jive+'/blog', basicAuth);
    }
    
    // true means single page
    if(radio == "true")
    {
      var page         = SitesApp.getPageByUrl(sourcepage);
      // check if Google Sites Page
      if(page == null) {
        deleteFromPageSummaries(sourcepage);
        app.getElementById("htmlContainer").setText('This page and all subpages was deleted from database: ' + sourcepage + '\n');
        app.getElementById("copyBtn").setText("Deleted complete");
        app.getElementById("copyBtn").setEnabled(true);
        return app;
      }
      
      var oldHtml  = page.getHtmlContent();
      var oldTitle = page.getTitle();
      var oldType  = page.getPageType();
      
      // check if it has a slash(/) at the end of url, and erase it.
      if(sourcepage.slice(-1) == '/') {
        sourcepage = sourcepage.slice(0,-1);
      }
      
      var flag = 0;
      //check if copied page already has a "Moved Permanently" header
      if(oldHtml.indexOf('HTTP/1.1 301 Moved Permanently') == -1)
      {
        data = createDocument(page, newpagelocation_jive, findString, replaceString, sourcejivetrue, tags, oldType, basicAuth);
        
        //var jive_url = 'https://acme.jiveon.com/docs/DOC-'+data.document_no;
        if(redirectpage == "true") {
          
          permanentlyMove(page.getUrl(), data.document_url);
          original_page_status = 'migration_completed';
        } else {
          original_page_status = 'copied_only';
        }
        
        var date_now = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd HH:mm:ss");
        var jiveFields = {  page_title : oldTitle, 
                            page_web_link : sourcepage, 
                            page_uri : '', 
                            placeid : data.new_place_id, 
                            jive_url : data.document_url, 
                            jive_page_title : data.title, 
                            original_page_status : original_page_status, 
                            jive_account : basicAuth.split(':')[0],
                            google_account : currentuser, 
                            spoof_account : '', 
                            migrate_date : date_now, 
                            last_touched_date : date_now };
        
        dbInsertInTable(jiveFields, jive_page_export_table);
        logger_text += "Success!\n";
        logger_text += '***\n';
        flag = 1;
      } else {
        
        logger_text += "This page was already was copied in acmecorp newsnet\n";
        logger_text += '***\n';
      }
      
      if(flag == 1) {
        if(typeof data.document_url !== "undefined") {
          app.getElementById("clickMeHyperLink").setText(oldTitle).setHref(data.document_url);
        }
      }
    } else {
      var where = ""; 
      if(new_place_id == "") {
        where = "placeid = "+new_blog_place_id+" ";
      } else {
        where = "placeid IN("+new_blog_place_id+", "+new_place_id+") ";
      }
      query = "SELECT p.page_web_link as page_link, jp.original_page_status as status, p.page_type as page_type " +
                  "FROM " + page_summaries_table + " p " +
                  "LEFT JOIN (SELECT * FROM " + jive_page_export_table + " WHERE "+where+" ) jp ON p.page_web_link = jp.page_web_link " +
                  "WHERE p.page_web_link LIKE '" + sourcepage+"%' and jp.original_page_status is null  " +
                  "ORDER BY p.created_date ASC " +
                  "LIMIT 20";
                  //and p.created_date > '2014-12-31 23:59:59'
      Logger.log(query);
      var rs1 = stmt.executeQuery(query);
      
      while(rs1.next())
      {
        var number = 0;
        var page_url  = rs1.getString(1);
        var status    = rs1.getString(2);
        var page_type = rs1.getString(3);
        
        if(page_url.indexOf("%E2%80%") > 0) {
          statusInJive(page_url, '0', 'bad_url', basicAuth);
          logger_text += 'This was saved as bad_url because of a special character from url:\n';
          logger_text += page_url+ '\n';
          logger_text += '***\n';
        } else {
          var children         = SitesApp.getPageByUrl(page_url);
          // check if Google Sites Page
          if(children == null) {
            deleteFromPageSummaries(page_url);
            logger_text += 'This page and all subpages was deleted from database: \n';
            logger_text += page_url+ '\n';
            logger_text += '***\n';
          } else {
            var childUrl   = children.getUrl();
            var childHtml  = children.getHtmlContent();
            var childTitle = children.getTitle();
            
            var data = createDocument(children, newpagelocation_jive, findString, replaceString, sourcejivetrue, tags, page_type, basicAuth);
            
            if(data.jive_id == 0) {
              logger_text += data.message+':\n';
              logger_text += childUrl+ '\n';
              logger_text += '***\n';
              
            } else {
            
              //var jive_url = 'https://acme.jiveon.com/docs/DOC-'+data.document_no;
              if(redirectpage == "true")
              { 
                permanentlyMove(childUrl, data.document_url);
                original_page_status = 'migration_completed';
              } else {
                original_page_status = 'copied_only';
              }
              
              var date_now2 = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd HH:mm:ss");
              var jiveFields2 = { 
                        page_title : childTitle, 
                        page_web_link : childUrl, 
                        page_uri : '', 
                        placeid : data.new_place_id, 
                        jive_url : data.document_url, 
                        jive_page_title : data.title, 
                        jive_id: data.jive_id,
                        jive_content_id: data.jive_content_id,
                        jive_content_type: data.jive_content_type,
                        original_page_status : original_page_status, 
                        jive_account : basicAuth.split(':')[0],
                        google_account : currentuser, 
                        spoof_account : '', 
                        migrate_date : date_now2, 
                        last_touched_date : date_now2 
              };
              
              dbInsertInTable(jiveFields2, jive_page_export_table);
              
              logger_text += 'Success!\n';
              logger_text += '***\n';
            }
          }
        }
        number++;
      }
      
      var query1 = "SELECT COUNT(p.page_web_link) " +
                  "FROM " + page_summaries_table + " p " +
                  "LEFT JOIN (SELECT * FROM " + jive_page_export_table + " WHERE " + where + " OR placeid = 0) jp ON p.page_web_link = jp.page_web_link " +
                  "WHERE p.page_web_link LIKE '" + sourcepage+"%' and jp.original_page_status is null ";
      var rs2 = stmt1.executeQuery(query1);
      var pages_left = 0;
      while(rs2.next())
      {
        pages_left = rs2.getString(1);
      }
      if(pages_left > 0) {
        logger_text += 'Run script again!\n';
        logger_text += '***\n';
      } else {
        logger_text += 'The End!\n';
        logger_text += '***\n';
      }
    }
    
    app.getElementById("clickMeHyperLink").setText(newpagelocation_jive).setHref(newpagelocation_jive);
    
    app.getElementById("htmlContainer").setText(logger_text);
    app.getElementById("copyBtn").setText("Copy Complete");
    app.getElementById("copyBtn").setEnabled(true);
    return app;
  } catch(err) {
    var errInfo = "Caught something:\n"; 
    for (var prop in err)  {  
      errInfo += "  property: "+ prop+ "\n    value: ["+ err[prop]+ "]\n"; 
    } 
    errInfo += "  toString(): " + " value: [" + err.toString() + "]\n<br>" + query; 
    
    app.getElementById("errorText").setText(errInfo);
    app.getElementById("copyBtn").setText("Try again");
    app.getElementById("copyBtn").setEnabled(true);
    return app;
  }
  return app;
}

function settopages(e)
{
  var app = UiApp.getActiveApplication();
  //change text on button letting user know function is processing  
  app.getElementById("copyBtn").setText("Copy Page(s)");
  
  return app;
}

function settopage(e)
{
  var app = UiApp.getActiveApplication();
  //change text on button letting user know function is processing  
  app.getElementById("copyBtn").setText("Copy Page");
  return app;
}


function settounder(e)
{
  var app = UiApp.getActiveApplication();
  //change text on button letting user know function is processing
  
  app.getElementById("destLabel").setText('URL of new location (new page\'s parent page): ');
  
  return app;
}


function settoreplace(e)
{
  var app = UiApp.getActiveApplication();
  //change text on button letting user know function is processing
  app.getElementById("destLabel").setText('URL of old page to replace: ');  
  return app;
}


function mouseDownHandler(e)
{
  var app = UiApp.getActiveApplication();
  
  //change text on button letting user know function is processing
  app.getElementById("copyBtn").setText("Copying Pages...Please Wait");
  
  //disable the button to stop them from pressing it multiple times
  app.getElementById("copyBtn").setEnabled(false);
  
  return app;
}



function pagewarstories()
{

  var rootproject = "https://sites.google.com/a/acme.com/201308copy2"; 
  rootproject = rootproject + "/" + "cloud-initiative";
  suffixpagetitles(rootproject," (test)");
  
  var fromblog =  SitesApp.getPageByUrl(rootproject + "/cloud-architects");
  var toblog =  SitesApp.getPageByUrl(rootproject + "/cloud-initiative-q-a");
  
  fromblog.setParent(toblog);
}




function suffixpagetitles(parentpages,newsuffix)
{  
  var fromblog =  SitesApp.getPageByUrl(parentpages);
  var newblogtitle = fromblog.getTitle();
  
  if(newblogtitle.substring(newblogtitle.length,newblogtitle.length-newsuffix.length)!=newsuffix) fromblog.setTitle(newblogtitle + newsuffix);
  
  var nextbloc = 0;
  
  while(true)
  {
    var pages2 = fromblog.getChildren({"start":nextbloc,
                        "max":10,
                         includeDrafts: false,
                        includeDeleted: false,
                      });
      
      if (pages2.length > 0){
        
        var i = nextbloc;
        for (var x in pages2) {
     
    
          newblogtitle = pages2[x].getTitle();
         
          
          try{
          
              var titlestrg = pages2[x].getTitle();
              if(titlestrg.substring(titlestrg.length,titlestrg.length-newsuffix.length)!=newsuffix) pages2[x].setTitle(newblogtitle + newsuffix);
                
                suffixpagetitles(pages2[x].getUrl(),newsuffix);
                                  
          } catch(err) {
            Logger.log(err);
          }       
          i = i + 1;     
        }    
      } else {
        break;      
      }
      nextbloc = nextbloc + 20;
  }       
}



function copysinglepageold(sourcepage,newpagelocation)
{  
  var fromblog =  SitesApp.getPageByUrl(sourcepage);
  var toblog =  SitesApp.getPageByUrl(newpagelocation); 
  var newpage = toblog.createWebPage(fromblog.getTitle(), fromblog.getName(), fromblog.getHtmlContent());
  return newpage;
}

function testdeletehierarchy()
{ 
  var today = new Date();
  var TimeStampMonth = Utilities.formatDate(today, "GMT", "yyyyMM");
  
  Logger.log("TimeStampMonth: " + TimeStampMonth);
  
  TimeStampMonth--;
  Logger.log("TimeStampMonth - 1: " + TimeStampMonth);
}

function deletehierarchy()
{ 
  var fromblogname = "https://sites.google.com/a/acme.com/GoogleSites4acmecorpsym/home"; //======= URL for test site - https://sites.google.com/a/acme.com/test-copy-of-people-search/people
  
  var fromblog =  SitesApp.getPageByUrl(fromblogname);
  
  var today = new Date();
  var TimeStampMonth = Utilities.formatDate(today, "GMT", "yyyyMM");
  
  Logger.log("TimeStampMonth: "+TimeStampMonth)
  
  TimeStampMonth--;  
  
  var nextbloc = 0;
  
  while (true) {
    var pages2 = fromblog.getAllDescendants({"start":nextbloc, "max":20 });
    if (pages2.length > 0){
      
      Logger.log("starting at.."+nextbloc+" there are .."+pages2.length+" pages starting with.."+pages2[0].getTitle());
      var i = nextbloc;
      for (var x in pages2) {
        
        var publishedmonth = Utilities.formatDate(pages2[x].getDatePublished(),"GMT","yyyyMM")
        Logger.log("publishedmonth: "+publishedmonth);
        
        Logger.log("date: "+pages2[x].getDatePublished());
        Logger.log("Title: "+pages2[x].getTitle());
        
        pages2[x].deletePage();
        i = i + 1;          
      }    
    } else {
      break;      
    }
    nextbloc = nextbloc + 20;
  }      
}