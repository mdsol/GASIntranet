/* //////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////********* Global Variables Declaration ***********/////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////// */

var basicUrl  = 'https://acme.jiveon.com'; 
var jivesearchpath = basicUrl + "/search.jspa?q=";

//============================================= Headers ==================================================
var apiCore   = '/api/core/v3/';
//var headers   = { 'Authorization' : 'Basic ' + Utilities.base64Encode(basicAuth) };
//============================================= End Headers ==============================================

//============================================= Database     =============================================
var CLOUDSQL_INSTANCE = "acme.com:GoogleSitesdb:GoogleSitessql";
var CLOUDSQL_DATABASE = "mycloudsqldb";
//=================== END Database =======================================================================

var emailTo_unindexedPages = 'jdoe@acme.com';
//====================== Function to see Id, display-name and name of a specific space ===================
function testPlaceId()
{
  getSpacePlaceID("Knowledge Base");
}

//====================== Function that writes in Logger.log ID, displayName and name of a specific space ===================
//http://acme.uat5.hosted.jivesoftware.com/api/core/v3/places?sort=dateCreatedAsc&filter=type%28space%29
function getSpacePlaceID(space_name)
{
  var url = basicUrl+apiCore+'places?sort=dateCreatedAsc&filter=type%28space%29';
  var next_link;
  do
  {
    var response = sendGetData(url, basicAuth);
    var pl = response['list'];
    for(var i in pl)
    {
      var places_list = pl[i];
      if(places_list['name'] == space_name) {
        Logger.log("PlaceID:      " + places_list['placeID']);
        Logger.log("Name:         " + places_list['name']);
        Logger.log("Display name: " + places_list['displayName']);
        Logger.log('*****');
      }
    }
    
    if(typeof response['links']['next'] !== 'undefined') url = response['links']['next']; 
    else url = false;
    
  } while(url);
}


//====================== Function to see Id, display-name and name of a specific place (here spaces) ===================  
function addNewPlacesDb()
{
  getPlacesIDs('newsnet@acme.com:yourpassword');
}

//====================== Function that writes in Logger.log ID, displayName and name of all specific place ===================
//http://acme.uat5.hosted.jivesoftware.com/api/core/v3/places?sort=dateCreatedAsc&filter=type%28space%29
function getPlacesIDs(basicAuth)
{

  var dsn  = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn = Jdbc.getCloudSqlConnection(dsn);
  
  var url = basicUrl+apiCore+'places?sort=dateCreatedAsc&count=5&fields=id,placeID,contentTypes,name,displayName,parent,type,published';
  var next_link;
  do
  {
    var response = sendGetData(url, basicAuth);
    var pl = response['list'];
    for(var i in pl)
    {
      var places_list = pl[i];
      //Logger.log(places_list);
      Logger.log("PlaceID:      " + places_list['placeID']);
      Logger.log("Name:         " + places_list['name']);
      Logger.log("Display name: " + places_list['displayName']);
      Logger.log("Type:         " + places_list['type']);
      
      var query = "SELECT COUNT(`place_id`) FROM `" + jive_places_table + "` WHERE `place_id` = ?";
      var stmt = conn.prepareStatement(query);
      stmt.setString(1, places_list['placeID']);
      
      var rs = stmt.executeQuery(query);
      while(rs.next())
      {
        if(rs.getString(1) == 0) {
          var date1 = places_list['published'].substring(0,18);
          var parent = '';
          if(typeof places_list['parent'] == "undefined") parent = ''; else parent = places_list['parent'];
          var fields = {  jive_id :       places_list['id'],
                          html:           places_list['resources']['html']['ref'],
                          place_id :      places_list['placeID'],
                          content_types : places_list['contentTypes'],
                          name :          places_list['name'],
                          display_name :  places_list['displayName'],
                          parent :        parent,
                          type :          places_list['type'],
                          published :     date1.replace('T', ' ')
             }
          Logger.log('*****');
          dbInsertInTable(fields, jive_places_table);
        }
      }
    }
    
    url = false;
    if(response.hasOwnProperty('links')) {
      if(typeof response['links']['next'] !== 'undefined') 
        url = response['links']['next']; 
    }
    
  } while(url);
}

function testBlogPostUrl()
{
  blogPostUrl('9073', '2116');
}
//curl -v -u newsnet@acme.com:yourpassword 'https://acme.jiveon.com/api/core/v3/contents?filter=type(post)&filter=place(/api/core/v3/places/9103)&count=5
function blogPostUrl(place_id, document_id)
{
  var url = basicUrl+apiCore+'contents?filter=type(post)&filter=place(/api/core/v3/places/'+place_id+')&fields=id,placeID';
  
  var next_link;
  do
  {
    var response = sendGetData(url, basicAuth);
    
    var pl = response;
    for(var i in pl)
    {
      var places_list = pl[i];
      if(places_list['id'] == document_id) {
        return places_list['resources']['html']['ref'];
      }
    }
    
    url = false;
    if(response.hasOwnProperty('links')) {
      if(typeof response['links']['next'] !== 'undefined') 
        url = response['links']['next']; 
    }
    
  } while(url);
}
function testGetSpaceIdByUrl()
{
  getSpaceIdByUrl('https://acme.jiveon.com/groups/secret', 'adoe@acme.com:yourpassword')
  
}

//====================== Function to see Id, display-name and name of a specific place (here spaces) ===================  
//POST
function getSpaceIdByUrl(spaceHtmlUrl, basicAuth)
{
  /*var type = "";
  if(spaceHtmlUrl.indexOf("/blog") > 0) {
      type = "?filter=type(blog)";
  } else if(spaceHtmlUrl.indexOf("/projects/") > 0) {
    type = "?filter=type(project)";
  } else if(spaceHtmlUrl.indexOf("/groups/") > 0) {
    type = "?filter=type(group)";
  } else if(spaceHtmlUrl.indexOf("/community/") > 0) {
    type = "?filter=type(space)";
  }*/
    
  var url = basicUrl+apiCore+'places?fields=id,placeID';
  var next_link;
  
  do
  {
    var response = sendGetData(url, basicAuth);
    var pl = response['list'];
    for(var i in pl)
    {
      var places_list = pl[i];
      if(places_list['resources']['html']['ref'] == spaceHtmlUrl) {
        //Logger.log("PlaceID:      " + places_list['placeID']);
        //Logger.log("id:      " + places_list['id']);
        //Logger.log("Name:         " + places_list['name']);
        //Logger.log("Display name: " + places_list['displayName']);
        //Logger.log('*****');
        
        return places_list['placeID'];
      }
    }
    
    if(typeof response['links']['next'] !== 'undefined') {
      url = response['links']['next']; 
    } else {
      url = false;
    }
    
  } while(url);
  return 0;
}

function testCheckIfPersonalBlog(newpagelocation_jive)
{
  checkIfPersonalBlog("https://acme.jiveon.com/people/newsnet%40acme.com/blog", 'newsnet@acme.com:yourpassword');
}

function checkIfPersonalBlog(jive_url, basicAuth)
{
  jive_url = decodeURIComponent(jive_url);
  var blog_id = 0;
  var username = findUsernameInJiveUrl(jive_url);
  if(typeof username !== 'undefined') {
    blog_id = findPersonalBlogId(username, basicAuth);
  }
  return blog_id;
}

//====================== Function that test creation a space with given data ===================
function testCreateSpace()
{
  createSpace("Testing", "testing", "Testing description");
}

//====================== Function that create a spaces ===================
//curl -v -u adoe:yourpassword -k --header "Content-Type: application/json" -d '{"visibility": "people", "name": "My Special Place" , "displayName": "my-special-space", "description" : "A place for topics that dont seem to fit anywhere else.","type": "space" }' 'http://acme.uat5.hosted.jivesoftware.com/api/core/v3/places'
function createSpace(name, displayName, description)
{
  var payload = '{"visibility": "people","name": "'+name+'","displayName": "'+displayName+'", "description" : "'+description+'","type": "space"}';
  var response = sendPostData('places', payload, basicAuth);
  
  if(response.getResponseCode() == 409) {
    var error = showError(response);
    Logger.log(error);
  } else {
    var rawData = response.getContentText();
    var space = JSON.parse(rawData);
    Logger.log(space['placeID']);
    return space['placeID'];
  }
}


//====================== Function test that returns 'jdoe' user data ===================
function testEmailUserDataLoad()
{
  emailUserDataLoad('adoe@acme.com');
 
}

// !!!!!!!! Access a document: curl -v -u adoe@acme.com:yourpassword 'https://acme.jiveon.com/api/core/v3/contents?filter=entityDescriptor(102,6338)'
// !!!!!!!! Access a blog post: curl -v -u adoe@acme.com:yourpassword 'https://acme.jiveon.com/api/core/v3/contents?filter=entityDescriptor(38,2330)'
//====================== Function that returns username data ===================
function emailUserDataLoad(username)
{
  var params = {
    'method' : 'GET',
    'headers' : { 'Authorization' : 'Basic ' + Utilities.base64Encode('adoe@acme.com:yourpassword') }
  };
  
  var url      = basicUrl + apiCore + 'people/username/'+ username;
  var response = UrlFetchApp.fetch(url, params);
  var rawData  = response.getContentText();
  
  rawData = rawData.split(";"); 
  
  var space = JSON.parse(rawData[1]);
  
  Logger.log(space['resources']['blog']['ref']);
  Logger.log('Name: '+space['name']['formatted']);
  Logger.log('People ID: '+space['id']);
}

function findUsernameInJiveUrl(jive_url)
{
  var username;
  var url = jive_url.split("/");
  
  for(var a in url) {
    if(url[a].indexOf('@acme.com') > -1)
    {
      username = url[a];
    }
  }
  return username;
}

function findPersonalBlogId(username, basicAuth)
{
  var params = {
    'method' : 'GET',
    'headers' : { 'Authorization' : 'Basic ' + Utilities.base64Encode(basicAuth) }
  };
  
  var url      = basicUrl + apiCore + 'people/username/'+ username;
  var response = UrlFetchApp.fetch(url, params);
  var rawData  = response.getContentText();
  
  rawData = rawData.split(";"); 
  
  var space = JSON.parse(rawData[1]);
  var blog_url = space['resources']['blog']['ref'];
  var blog_url1 = blog_url.split('/');
  var length = blog_url1.length;
  
  return blog_url1[length-1];
}

function testCheck()
{
  checkPageTitleJive('How to Upload a Product Document to DocuShare', 'https://sites.google.com/a/acme.com/knowledgebase/home/general/docushare/how-to-upload-a-docushare-product-document', '11927');
}

function checkPageTitleJive(content_subject, content_url, new_place_id)
{
  var subject = content_subject;
  var dsn  = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn = Jdbc.getCloudSqlConnection(dsn);
  
  var query = "SELECT COUNT(DISTINCT `page_web_link`) FROM `" + jive_page_export_table + "` WHERE `placeid` = ? AND `jive_page_title` = ? AND `page_web_link` != ?";
  var stmt = conn.prepareStatement(query);
  stmt.setString(1, new_place_id);
  stmt.setString(2, content_subject);
  stmt.setString(3, content_url);
  var rs = stmt.executeQuery(query);
  
  while(rs.next())
  {
    if(rs.getString(1) > 0) {
      var i=1;
      do {
        subject = content_subject+"["+i+"]";
        var query = "SELECT COUNT(DISTINCT `page_web_link`) FROM `" + jive_page_export_table + "` WHERE `placeid` = ? AND `jive_page_title` = ? AND `page_web_link` != ?";
        var stmt = conn.prepareStatement(query);
        stmt.setString(1, new_place_id);
        stmt.setString(2, subject);
        stmt.setString(3, content_url);
        var rs = stmt.executeQuery(query);
        while(rs.next())
        {
          if(rs.getString(1) > 0) {
            i++;
          } else {
            i=0;
          }
        }
        
      } while(i != 0);
      
    }
  }
  return subject;
}

//====================== Function that creates documents in JIVE ===================
//curl -v -u adoe:yourpassword  -k --header "Content-Type: application/json" -d '{"visibility": "place", "parent": "http://acme.uat5.hosted.jivesoftware.com/api/core/v3/places/2022", "content": {"type": "text/html", "text": "<body><p>Here <b>comes</b> the body</p></body>"},"subject": "Andreeas content", "tags": [one, two, three] ,"type": "document"}' "http://acme.uat5.hosted.jivesoftware.com/api/core/v3/contents"
function createDocument(page, jive_place, findString, replaceString, sourcejivetrue, tags, page_type, basicAuth)
{
  var content_subject = page.getTitle();
  var content_text    = page.getHtmlContent();
  var content_url     = page.getUrl();
  var sourcePublishedDate = Utilities.formatDate(page.getDatePublished(),"GMT", "yyyy-MM-dd HH:mm:ss");
  var sourcePublishedAuthor = page.getAuthors()[0];
  
  var timestamp   = Utilities.formatDate(new Date(), "GMT", "yyyyMMddHHmmss");
  
  var parentURL   = basicUrl + apiCore + 'places/'+ new_place_id;
  
  var new_blog_id;
  var document_no = 0;
  var message     = '';
  
  var content_type = "document";
  
  // check if page title already exists in JIVE
  content_subject = checkPageTitleJive(content_subject, content_url, new_place_id);  
  content_text = removePermanentMove(content_text);
  content_text = content_text.replace(/'/g, "\'");
  content_text = content_text.replace(/"/g, "'");
  content_text = content_text.replace(/(\r\n|\n|\r)/g,"<br />");
  content_text = content_text.replace(/a href=\"\/#/g,"a href=\"#");
  content_text = content_text.replace(/(<font[^>]*>)|(<\/font>)/g, '');
  content_text = content_text.replace(/(<span[^>]*>)|(<\/span>)/g, '');
  content_text = content_text.replace(/https:\/\/sites.google.com\/a\/acme.com\/03\/ppl\/[a-z]{1}\/([a-z]{2,55})/g,jivesearchpath + '$1');  
  content_text = GoogleSitesreplace(content_text);
  
  content_subject = content_subject.replace(/'/g, "\'");
  content_subject = content_subject.replace(/"/g, "'");
  
  // replace string
  if(findString!="")
  { 
    var findStringre = new RegExp(findString,"g");
    content_text = content_text.replace(findStringre, replaceString);
    content_subject = content_subject.replace(findStringre, replaceString);
  }
  
  
  // attachments
  var attachments = page.getAttachments();
  var hasAttach   = "";
  
  // source
    var timestampsource = "";
  
  if(typeof attachments[0] !== "undefined")
  {
    content_text += "<br /><br /><div style='font-size: 16px;'> <span>Attachments:</span> </div><ul>"; 
    for(var i in attachments) {
      var attachment_url = attachments[i].getUrl();
      var ct_re = new RegExp("&","g");
      attachment_url = attachment_url.replace(ct_re, "&amp;");
      content_text += "<li><a href='"+attachment_url+"'>"+attachments[i].getTitle()+"</a></li>";
    }
    content_text += "</ul>";
    
    var hasAttach = "<a href='/docs/DOC-5053' _jive_internal='true'>hasGoogleSitesFiles</a>";
  }
  
  //write jive source
  if(sourcejivetrue == "true") {
    content_text = content_text + "<br /><br /><div style='font-size: 12px;'> <span></span> <a href='"+content_url+"'>GoogleSites Source</a>";
    if(hasAttach != "")
      content_text += ", ";
    else {
      content_text += "</div>";
    }
  }
  
  if(hasAttach != "") {
    content_text +=  hasAttach + "</div>";
  }
  var jive_type = 'document';
  var new_place_id = checkIfPersonalBlog(jive_place, basicAuth);
  var personal_blog = 1;
  if((typeof new_place_id == "undefined") || new_place_id == '0') {
    new_place_id = getSpaceIdByUrl(jive_place, basicAuth);
    personal_blog = 0;
  } else {
    jive_type = "post";
  }
  if(page_type == 'Announcement' || page_type == 'announcement')
  {
    jive_type = 'post';
    if(personal_blog == 0) { 
      new_place_id = getSpaceIdByUrl(jive_place + '/blog', basicAuth);
    }
    timestampsource = "<b>Originally published:</b> " + sourcePublishedDate;
    timestampsource += " GMT, <b>by:</b> " + sourcePublishedAuthor + "<br><br>";
    content_text =  timestampsource + content_text;
  }
  
  parentURL   = basicUrl + apiCore + 'places/'+ new_place_id;
  var payload  = '{"visibility": "place", "parent": "'+parentURL+'","content": {"type": "text/html", "text": "'+content_text+'"},"subject": "'+content_subject+'", "tags": ['+tags+'] ,"type": "'+jive_type+'"}';
  var response = sendPostData('contents', payload, basicAuth);
  
  // jive curl create document;
  if(response.getResponseCode() == 201)
  {
    var rawData = response.getContentText();
    var space = JSON.parse(rawData);
    var document_url = space['resources']['html']['ref'];
    var document_no = space['id'];
    var jive_content_id = space['contentID'];
    var jive_content_type = space['type'];
  } else if(response.getResponseCode() == 409) {
    message = '409 (Conflict) Document with the same name already exists';
    statusInJive(content_url, new_place_id, 'name_conflict', basicAuth);
  } else if(response.getResponseCode() == 500) {
    message = '500 HTTP error  - you need to copy that page, manually';
    statusInJive(content_url, new_place_id, 'http_error', basicAuth);
  } else {
    message = showError(response);
  }
  var out = { title: content_subject, jive_id: document_no, message: message, document_url: document_url, new_place_id: new_place_id, jive_content_type: jive_content_type, jive_content_id: jive_content_id};
  return out;
}


function GoogleSitesreplace(s)
{
  //Logger.log(s.slice(1000));
  s = s.replace(/(https:\/\/sites.google.com\/a\/acme.com\/[a-z0-9]{2,256}\/system\/app\/pages\/search\?)/g, 'https://acme.jiveon.com/search.jspa?')
  //.replace('<div>General Article Tracking Details</div>','')
  //.replace('Tracking Details (<em>Please do not remove</em>) TrackingDetails','')
  s = s.replace(/<p style='LINE-HEIGHT:2px'>TrackingDetails TrackingDetailsVersion<\/p>(.*?)'<\/div>/g, '');
  s = s.replace(/TrackingDetailsStart(.*?)TrackingDetailsEnd/g, '');
  return s;
  //.replace(/<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsStart<\/font>(.*?)<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsEnd<\/font>/g, '');
  
  //<p style="LINE-HEIGHT:2px"><font color="#ffffff">TrackingDetails TrackingDetailsVersion74</font></p>
  
  
  
  //.replace(/TrackingDetailsVersion[a-z0-9]{2}/g,'');
}

function testMove()
{
  permanentlyMove('https://sites.google.com/a/acme.com/201407sandbox/cloud-initiative/cloud-initiative-q-a/untitledpost', '1789');
}


function permanentlyMove(mypageurl, jive_url)
{
  var formattedDate = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");
  var document_link;
  var page          = SitesApp.getPageByUrl(mypageurl);
  var content_text  = page.getHtmlContent();
  var removeHeader  = removePermanentMove(content_text);
  
  if(removeHeader == content_text)
  {
    var header       = "<table style='color:black;font-family:sans-serif;line-height:19.0499992370605px;margin-right:123px;margin-left:13px;border-width:1px 1px 1px 10px;border-style:solid;border-color:rgb(170,170,170) rgb(170,170,170) rgb(170,170,170) rgb(128,128,128);background-image:initial;background-color:rgb(251,251,251)'><tbody><tr><td style='border:none;padding:2px 0px 2px 0.5em;text-align:center'><div style='width:52px'></div></td><td style='border:none;padding:0.25em 0.5em;width:802px'><p style='margin:0.4em 0px 0.5em;line-height:1.5em'><font size='3'><b>HTTP/1.1 301 Moved Permanently<br></b></font><b><font size='3'><span style='line-height:1.5em'>Location:</span></font></b><font size='3'><span style='line-height:1.5em'>&nbsp;</span><font color='#000066'><u><a href='xxxxyyyy' rel='nofollow' style='color:rgb(51,102,187);padding-left:0px;padding-top:0px!important;padding-right:0px!important;padding-bottom:0px!important;background:none!important' target='_blank' title='https://sites.google.com/a/acme.com/knowledgebase/system/app/pages/search?q=Debugging+Rave+Core+Service+in+5.6.x&amp;scope=search-ns'>xxxxyyyy</a></u></font><span style='line-height:1.5em'>&nbsp;&nbsp;</span></font></p><p style='margin:0.4em 0px 0.5em;line-height:1.5em'><span style='line-height:1.5em'><font size='1'>Moved on " + formattedDate + "</font></span><span style='line-height:1.5em'><font size='1'>&nbsp;as part of our migration to acmecorp newsnet. &nbsp;Please help us by copying over any images or other embedded media into the new KB version of the article, to help&nbsp;<a href='https://acme.jiveon.com/docs/DOC-1109' rel='nofollow' style='color:rgb(51,102,187);padding-left:0px;padding-top:0px!important;padding-right:0px!important;padding-bottom:0px!important;background:none!important' target='_blank' title='https://sites.google.com/a/acme.com/knowledgebase/home/general/google-sites/curating-imported-articles'>bring it inline with our best practices and standards</a>.&nbsp;</font></span><br>Thanks, the&nbsp;<a href='https://sites.google.com/a/acme.com/gld/home/blog/collaborationinitiative' rel='nofollow' style='color:rgb(51,102,187);padding-left:0px;padding-top:0px!important;padding-right:0px!important;padding-bottom:0px!important;background:none!important' target='_blank' title='https://sites.google.com/a/acme.com/knowledgebase/home/general/google-sites/knowledge-base-team'>acmecorp newsnet Team</a></p></td></tr></tbody></table>";
    
    var findStringre = new RegExp("xxxxyyyy","g");
    header = header.replace(findStringre, jive_url);
    
    var header_start1 = "<table class='sites-layout-name-one-column sites-layout-hbox' cellspacing='0'><tbody><tr><td class='sites-layout-tile sites-tile-name-content-1'>";
    var header_start2 = "<table class='sites-layout-name-one-column sites-layout-hbox' cellspacing='0'><tbody><tr><td class='sites-layout-tile sites-tile-name-content-1 sites-layout-empty-tile'/>";
    var header_start3 = "<div class='sites-layout-name-one-column-hf sites-layout-vbox'><div class='sites-layout-tile sites-tile-name-header'>";
    var header_start4 = "<div class='sites-layout-name-one-column-hf sites-layout-vbox'><div class='sites-layout-tile sites-tile-name-header sites-layout-empty-tile'>";
    var header_start5 = "<div class='sites-layout-name-one-column-hf sites-layout-vbox'><div class='sites-layout-tile sites-tile-name-header sites-layout-empty-tile'/><div class='sites-layout-tile sites-tile-name-content-1'>";
    var header_start6 = "<table class='sites-layout-name-two-column sites-layout-hbox' cellspacing='0'><tbody><tr><td class='sites-layout-tile sites-tile-name-content-1'>";
    var header_start7 = "<table class='sites-layout-name-two-column sites-layout-hbox' cellspacing='0'><tbody><tr><td class='sites-layout-tile sites-tile-name-content-1 sites-layout-empty-tile'/>";
    
    if(content_text.indexOf(header_start1) > -1)
    {
      header = header_start1 + header;
      content_text = content_text.replace(header_start1, header);
    }
    else if(content_text.indexOf(header_start2) > -1)
    {
      header = header_start2 + header;
      content_text = content_text.replace(header_start2, header);
    }
    else if(content_text.indexOf(header_start3) > -1) 
    {
      header = header_start3 + header;
      content_text = content_text.replace(header_start3, header);
    } 
    else if(content_text.indexOf(header_start4) > -1) 
    {
      header = header_start4 + header;
      content_text = content_text.replace(header_start4, header);
    }
    else if(content_text.indexOf(header_start5) > -1) 
    {
      header = header_start5 + header;
      content_text = content_text.replace(header_start5, header);
    } 
    else if(content_text.indexOf(header_start6) > -1) 
    {
      header = header_start6 + header;
      content_text = content_text.replace(header_start6, header);
    }
    else if(content_text.indexOf(header_start7) > -1) 
    {
      header = header_start7 + header;
      content_text = content_text.replace(header_start7, header);
    }
    
    content_text = content_text.replace(/'/g, "\'");
    content_text = content_text.replace(/"/g, "'");
    content_text = content_text.replace(/(\r\n|\n|\r)/g,"<br />");
    content_text = content_text.replace(/a href=\"\/#/g,"a href=\"#");
    content_text = content_text.replace(/(<font[^>]*>)|(<\/font>)/g, '');
    content_text = content_text.replace(/(<span[^>]*>)|(<\/span>)/g, '');
    
    page.setHtmlContent(content_text);
  }
}

function testReplace()
{
  var text = "dgfdsfsdfdsfsdfsdfsd <font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsStart</font>AAANANNAANNSNNNDNNDDM<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsEnd</font>";
  //text = text.replace(/\[<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsStart<\/font>\]\s*(((?!\[<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsStart<\/font>\]|\[<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsEnd<\/font>\]).)+)\s*\[<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsEnd<\/font>\]/g, 'Ana are mere');
  
  //text = text.replace(/<font color='#ffffff' style='font-family:verdana,sans-serif'>(.*?)<\/font>/g, '');
  text = text.replace(/<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsStart<\/font>(.*?)<font color='#ffffff' style='font-family:verdana,sans-serif'>TrackingDetailsEnd<\/font>/g, '');
  
  Logger.log(text);
}

function testRemoveHeader()
{
  var html = SitesApp.getPageByUrl('https://sites.google.com/a/acme.com/201305sand/home/Around-acmecorp/iacmecorp201115released');
  removePermanentMove(html.getHtmlContent());
  
}

function removePermanentMove(pageHtml)
{
  var header_start = "<table style='color:black;font-family:sans-serif;line-height:19.0499992370605px;margin-right:123px;margin-left:13px;border-width";
  var header_end = "href='https://sites.google.com/a/acme.com/gld/home/blog/collaborationinitiative'>acmecorp newsnet Team</a></p></td></tr></tbody></table>";
  
  var start = pageHtml.indexOf(header_start);
  if(start > 0) {
    var end = pageHtml.indexOf(header_end);
    var sourceHtml = pageHtml.substring(start, end+137);
    pageHtml = pageHtml.replace(sourceHtml, '');
  }
  
  return pageHtml;
  
}

function checkIndexedPage(sourcepage)
{
  var dsn  = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn = Jdbc.getCloudSqlConnection(dsn);
  var stmt = conn.createStatement();
  
  var query1 = "SELECT COUNT(*) FROM `"+page_summaries_table+"` WHERE `page_web_link` = '"+ sourcepage+"' LIMIT 1";
  var rs = stmt.executeQuery(query1);
  
  while(rs.next()) {
    if(rs.getString(1) == 0) {
      var message = "Hi, \n\n" +
        "Page with this url: " + sourcepage + "is not indexed in page_summaries table \n" +
        "Please run the script who's migrating files!"
      MailApp.sendEmail(emailTo_unindexedPages, 'Un-indexed page from Jive migration', message);
      return false;
    } else {
      return true;
    }
  }
}

//====================== Function that send data via method GET ===================
function sendGetData(url, basicAuth)
{
  var params = {
    'method' : 'GET',
    'muteHttpExceptions' : true,
    'headers' : { 'Authorization' : 'Basic ' + Utilities.base64Encode(basicAuth) }
  };
  
  var response = UrlFetchApp.fetch(url, params);  
  var rawData = response.getContentText();
  rawData = rawData.split(";");
  return JSON.parse(rawData[1]);
}


//====================== Function that send data via method POST ===================
function sendPostData(jiveType, payload, basicAuth)
{
  var url = basicUrl + apiCore + jiveType;
  var params = {
    'method' : 'POST',
    'muteHttpExceptions' : true,
    'headers' : { 'Authorization' : 'Basic ' + Utilities.base64Encode(basicAuth) },
    'contentType' : 'application/json',
    'contentLength': 99000,
    'payload' : payload
  };
  
  var response = UrlFetchApp.fetch(url, params);  
  return response;
}


//====================== Function that returns error message from UrlFetchApp ===================
function showError(response)
{
  var error = response.getContentText();
  error = JSON.parse(error);
  
  var error_message = response.getResponseCode() + ' - '+error['error']['message'];
  return error_message;
}
//================================================= END Copy Page Samples =============================================


//================================================= DB functions ======================================================
function deleteFromPageSummaries(sourcepage)
{
  var dsn  = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn = Jdbc.getCloudSqlConnection(dsn);
  var stmt = conn.createStatement();
  
  var query = "DELETE FROM `"+page_summaries_table+"` WHERE `page_web_link` = '"+ sourcepage+"'";
  stmt.executeUpdate(query);
  
  var query1 = "SELECT `page_web_link` FROM `"+page_summaries_table+"` WHERE `page_web_link` LIKE '"+ sourcepage+"%'";
  var rs = stmt.executeQuery(query1);
  
  while(rs.next()) {
    var query2 = "DELETE FROM `"+page_summaries_table+"` WHERE `page_web_link` = '"+ rs1.getString(1)+"'";
    stmt.executeUpdate(query2);
  }
}


function statusInJive(page_url, new_place_id, status, basicAuth)
{
  
  var dsn  = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn = Jdbc.getCloudSqlConnection(dsn);
  var stmt = conn.createStatement();
  
  var query = "SELECT `page_web_link` FROM `"+jive_page_export_table+"` WHERE `page_web_link` LIKE '"+ page_url+"%' LIMIT 1";
  var rs = stmt.executeQuery(query);
  
  var flag = 0;
  while(rs.next())
  {
    var query = "UPDATE `"+jive_page_export_table+"` SET `original_page_status` = '" + status + "', `last_touched_date` = '" + Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd HH:mm:ss") + "', `placeid`='"+new_place_id+"' WHERE `page_web_link` = ?";
    var stmt2 = conn.prepareStatement(query);
    stmt2.setString(1, page_url);
    stmt2.execute();
    flag = 1;
  }
  
  if(flag == 0) {
  
    var query1 = "SELECT `title`, `page_web_link` FROM `"+page_summaries_table+"` WHERE `page_web_link` LIKE '"+ page_url+"%' LIMIT 1";
    var rs1 = stmt.executeQuery(query1);
    while(rs1.next())
    {
      var date_now = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd HH:mm:ss");
      var query2 = "INSERT INTO `"+jive_page_export_table+"` (`page_title`,`page_web_link`, `placeid`, `original_page_status`, `google_account`, `jive_account`, `migrate_date`, `last_touched_date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      var stmt3 = conn.prepareStatement(query2);
      stmt3.setString(1, rs1.getString(1));
      stmt3.setString(2, rs1.getString(2));
      stmt3.setString(3, new_place_id);
      stmt3.setString(4, status);
      stmt3.setString(5, currentuser);
      stmt3.setString(6, basicAuth.split(':')[0]);
      stmt3.setString(7, date_now);
      stmt3.setString(8, date_now);
      stmt3.execute();
      Utilities.sleep(1000);
    }
  }
  
  conn.commit(); // When this returns, this is when changes are actually commited
  conn.close();
      
}

function testSaveInDb()
{
  var date_now = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd HH:mm:ss");
  
  var jiveFields = { 
    page_title : 'Test',
    page_web_link : 'https://sites.google.com/a/acme.com/201407sandbox/test',
    page_uri : '',
    placeid : '1111',
    jive_url : 'https://acme.jiveon.com/docs/DOC-2323',
    original_page_status : 'test_jive',
    jive_account : 'Test',
    google_account : 'Test',
    spoof_account : '',
    migrate_date : date_now, 
    last_touched_date : date_now
  };
  saveInDb(jiveFields);
}

function saveInDb(fields)
{
  var dsn   = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn  = Jdbc.getCloudSqlConnection(dsn);
  var stmt1 = conn.createStatement();
  
  var page_web_link   = fields['page_web_link'];
  var jive_page_title = fields['jive_page_title'];
  var place_id = fields['placeid'];
  
  //Logger.log(jive_page_title);
  
  var query = "SELECT COUNT(*) FROM `"+jive_page_export_table+"` WHERE `page_web_link` = '"+ page_web_link+"' AND `placeid` = '"+place_id+"'";
  
  var rs1 = stmt1.executeQuery(query);
  
  while(rs1.next()) {
    if(rs1.getString(1) == 1) {
      dbUpdate(fields, page_web_link);
    } else {
      dbInsertInTable(fields, jive_page_export_table);
    }
  }
}


function dbInsertInTable(fields, table)
{
  var dsn   = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn  = Jdbc.getCloudSqlConnection(dsn);
    
  var query = "INSERT INTO `"+table+"` (";
  
  for(var key in fields)
  {
    query += key+", ";
  }
  
  query = query.substring(0, query.length-2) + ") VALUES (";
  for(var key in fields)
  {
    query += "?, ";
  }
  query = query.substring(0, query.length-2) + ")";
  var stmt = conn.prepareStatement(query);
  
  var i = 1;
  for(var key in fields)
  {
    stmt.setString(i, fields[key]);
    i++;
  }
  stmt.execute();
  Utilities.sleep(1000);

  conn.commit(); // When this returns, this is when changes are actually commited
  conn.close();
}


function testUpdate()
{
  var where = 'https://sites.google.com/a/acme.com/201407sandbox/cloud-initiative/cloud-initiative-q-a/qwillbuyingtheacmecorpclinicalcloudbeanall-or-nothingpurchase';
  
  var fields = new Array();
              fields['page_title'] = 'Test';
              fields['page_web_link'] = where;
              fields['placeid'] = 1111;
              fields['jive_url'] = 'Test';
              fields['original_page_status'] = 'Test';
              fields['jive_account'] = 'Test';
              fields['google_account'] = 'Test';
              fields['spoof_account'] = 'Test';
              fields['migrate_date'] = '2015-01-31 14:04:00';
  dbUpdate(fields, where);
}


function dbUpdate(fields, page_web_link)
{
  var dsn   = "jdbc:google:rdbms://" + CLOUDSQL_INSTANCE + "/" + CLOUDSQL_DATABASE;
  var conn  = Jdbc.getCloudSqlConnection(dsn);
  
  var query = "UPDATE "+jive_page_export_table+" SET ";
  for(var key in fields) {
    query += key+" = ?, ";
  }
  
  query = query.substring(0, query.length-2) + " ";
  query += "WHERE page_web_link = ?";
  
  var stmt = conn.prepareStatement(query);
  
  var i = 1;
  for(var key in fields)
  {
    stmt.setString(i, fields[key]);
    i++;
  }
  stmt.setString(i, page_web_link);
  stmt.execute();
  
  Utilities.sleep(1000);

  conn.commit(); // When this returns, this is when changes are actually commited
  conn.close();
}
//================================================= END DB functions ==================================================