import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import xml2js from 'xml2js';
import { saveAs } from 'file-saver';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Rule } from '../model/rule';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
//import exportFromJSON from 'export-from-json';
 import {
   AlignmentType,
   Document,
   HeadingLevel,
   Packer,
   Paragraph,
   TabStopPosition,
   TabStopType,
   TextRun,  Table, TableCell, TableRow, BorderStyle
 } from "docx";
import { DocumentItem } from '../model/document-item';
import { Source } from '../model/source';
 import { SimpleQueryCondition } from '../model/simple-query-condition';
 import { SourceOwner } from '../model/source-owner';
 import { AuthenticationService } from '../service/authentication-service.service';
 import { ItemsList } from '@ng-select/ng-select/lib/items-list';
 import * as JSZip from 'jszip';


const RuleDescriptionMaxLength = 50;

@Component({
  selector: 'app-org-config-export',
  templateUrl: './org-config-export.component.html',
  styleUrls: ['./org-config-export.component.css']
})

export class OrgConfigExportComponent implements OnInit {
  ruleToImport: Rule;
  ruleToUpdate: Rule;
  ruleToDelete: Rule;
  deleteRuleNameText: string;
  rules: Rule[];
  validToSubmit: boolean;
  invalidMessage: string[];
  searchText: string;
  loading: boolean;

  //new stuff
  content: any[];
   selectAll: boolean;
   documentItems: DocumentItem[];
   readyForGenerate = false;
   zip: JSZip = new JSZip();
   zipFolder: JSZip = new JSZip();


  public modalRef: BsModalRef;
  
  @ViewChild('importRuleConfirmModal', { static: false }) importRuleConfirmModal: ModalDirective;
  @ViewChild('updateRuleConfirmModal', { static: false }) updateRuleConfirmModal: ModalDirective;
  @ViewChild('deleteRuleConfirmModal', { static: false }) deleteRuleConfirmModal: ModalDirective;
  @ViewChild('exportFolder', {static: false}) exportFolder: ElementRef;
  @ViewChild('updateRuleFile', {static: false}) updateRuleFile: ElementRef;

  constructor(
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
     
  }


  //new

  downloadJson() {

      this.idnService.getConnectorRules()
            .subscribe(
              results => {
              this.rules = [];
              for (let each of results) {
                let rule = new Rule();
                let jsonData = JSON.stringify(each, null, 4);
              //  jsonData = jsonData.replace(/\\n/g, '');
              //  jsonData = jsonData.replace(/\\t/g, '');
                //let pasrsedJson = JSON.parse(stringifyData);
               //console.log(pasrsedJson);
                this.zipFolder = this.zip.folder("rules/connector");
                this.zipFolder.file(`${each.name}.json`, jsonData);
                
              }

              
             this.zip.generateAsync({type:"blob"}).then(function(content) {
                saveAs(content, "connector-rules.zip");
            });

             // console.log(this.zipFile);


            });





            
    }
    
    

    //this.idnService.getConnectorRules().subscribe(result => this.downloadFile(result));
    
    
    //const fileName = 'download';

//const exportType = 'json';

//exportFromJSON({ data, fileName, exportType });


 // }

  // private downloadFile(data: any) {
  //   const fileName = data[0].name;
  //   const exportType = 'json';

  //   exportFromJSON({ data, fileName, exportType });
  // }


  downloadDoc(){

  }
  //new
  ngOnInit() {
    this.reset(true);
  }

  reset(clearMsg: boolean) {
    this.content = [];
    this.documentItems = [];
    this. readyForGenerate = false;

    let allDoco = new DocumentItem();
    allDoco.name = "All";
    allDoco.description = "For all documents";
    allDoco.disabled = false;
    allDoco.selected = false;
    this.documentItems.push(allDoco);

    let orgConfigDoco = new DocumentItem();
    orgConfigDoco.name = "Org Config";
    orgConfigDoco.description = "Only for org configuration";
    orgConfigDoco.disabled = false;
    orgConfigDoco.selected = false;
    this.documentItems.push(orgConfigDoco);

    let identityProfilesDoco = new DocumentItem();
    identityProfilesDoco.name = "Identity Profiles";
    identityProfilesDoco.description = "Only for identy profiles";
    identityProfilesDoco.disabled = false;
    identityProfilesDoco.selected = false;
    this.documentItems.push(identityProfilesDoco);

    let sourcesDoco = new DocumentItem();
    sourcesDoco.name = "Sources";
    sourcesDoco.description = "Only for sources";
    sourcesDoco.disabled = false;
    sourcesDoco.selected = false;
    this.documentItems.push(sourcesDoco);

    let rulesDoco = new DocumentItem();
    rulesDoco.name = "Rules";
    rulesDoco.description = "Only for rules";
    rulesDoco.disabled = false;
    rulesDoco.selected = false;
    this.documentItems.push(rulesDoco);

    let transformsDoco = new DocumentItem();
    transformsDoco.name = "Transforms";
    transformsDoco.description = "Only for transforms";
    transformsDoco.disabled = false;
    transformsDoco.selected = false;
    this.documentItems.push(transformsDoco);

    if (clearMsg) {
      this.messageService.clearAll();
    } 
  }

  /*
  changeOnSelectAll() {
    this.messageService.clearError();
    
    this.documentItems.forEach(each => {
      console.log("this.selectAll: " + !this.selectAll);
      each.selected = !this.selectAll;
      
      if (each.selected) {
        if (each.newOwner == null) {
          each.newOwner = new SourceOwner();
        }
        each.newOwner.accountName = each.owner.accountName;
      } else {
        if (each.newOwner) {
          each.newOwner.accountName = null;
        }
      }
      
    });
  }
  */

  changeOnSelectAll($event) {
    this.messageService.clearError();
    if ($event.target.checked == true) {
      for (let item of this.documentItems) {
        if (item.name != "All") {
          item.disabled = true;
          item.selected = false;
        }
      }
      this.readyForGenerate = true;
    }
    else {
      for (let item of this.documentItems) {
        if (item.name != "All") {
          item.disabled = false;
        }
      }
      this.readyForGenerate = false;
    }
  }

  changeOnSelect($event, index: number) {
    this.messageService.clearError();

    if ($event.target.checked == true) {
      this.documentItems[0].selected = false;
      this.documentItems[0].disabled = true;

      this.readyForGenerate = true;
    }
    else {
      this.documentItems[index].selected = false;
      let unSelectedCount = 0;
      for (let item of this.documentItems) {
        console.log("name: " + item.name + " selected: " + item.selected);
        if (item.name != "All" && !item.selected) {
          unSelectedCount++;
        }
      }
      console.log("unSelectedCount: " + unSelectedCount);
      if (unSelectedCount == this.documentItems.length - 1) {
        this.documentItems[0].disabled = false;
        this.readyForGenerate = false;
      }
    }
    /*
    let unSelectedCount = 0;
    for (let item of this.documentItems) {
      if (item.name != "All" && !item.selected) {
        unSelectedCount++;
      }
    }

    if (unSelectedCount == this.documentItems.length - 1) {
      this.documentItems[0].disabled = false;
    }
    */
    /*
      else {
        for (let item of this.documentItems) {
          if (item.name != "All") {
            item.disabled = false;
          }
        }
      }

    // temp code for GUI
    
    */


    /*
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
      if (this.documentItems[index].newOwner) {
        this.documentItems[index].newOwner.accountName = null;
      }
    } else {
      if (this.documentItems[index].newOwner == null) {
        this.documentItems[index].newOwner = new SourceOwner();
      }
      this.documentItems[index].newOwner.accountName = this.soudocumentItemsrces[index].owner.accountName;
    }
    */
  }



  createHeaderTableCell(text: string) :TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
              new TextRun({
                  text: text,
                  bold: true
              })
          ]
        })
      ]
    });
  }

  createContentTableCell(text: string) :TableCell {
    return new TableCell({
      children: [
        new Paragraph(text)
      ]
    });
  }

  createHeading(text: string): Paragraph {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.TITLE,
      thematicBreak: false
    });
  }

  //Prepare data of Sources
  async getAllSources() {

    let sources = [];

    let response = await this.idnService.searchAggregationSources().toPromise();

    for (let each of response) {
      let source = new Source();
      source.id = each.id;
      source.cloudExternalID = each.connectorAttributes.cloudExternalId;
      source.name = each.name;
      source.description = each.description;
      source.type = each.type;
      source.owner = new SourceOwner();
      source.owner.accountId = each.owner.id;

      sources.push(source);
    }

    for (let source of sources) {
      let query = new SimpleQueryCondition();
      query.attribute = "id";
      query.value = source.owner.accountId;
      let searchResult = await this.idnService.searchAccounts(query).toPromise();
      if (searchResult.length > 0) {
        source.owner.accountName = searchResult[0].name;
        source.owner.displayName = searchResult[0].displayName;
      }
    }

    return sources;
  }

  //Generate Document table for Sources
  createSourceSection(sources: Source[]) {
    let rowArr = [];
    let headerRow = new TableRow({
      children: [
          this.createHeaderTableCell("Name"),
          this.createHeaderTableCell("Connector"),
          this.createHeaderTableCell("Owner"),
          this.createHeaderTableCell("Description"),
          this.createHeaderTableCell("Authoritative"),
          this.createHeaderTableCell("Features")
      ],
    });

    rowArr.push(headerRow);

    for (let each of sources) {
      let contentRow = new TableRow({
        children: [
            this.createContentTableCell(each.name),
            this.createContentTableCell(each.type),
            this.createContentTableCell(each.owner.displayName),
            this.createContentTableCell(each.description),
            this.createContentTableCell("N/A"),
            this.createContentTableCell("N/A")
        ],
      });

      rowArr.push(contentRow);
    }

    let table = new Table({
      rows: rowArr
    });

    return table;
  }

  async generateDoc() {
    this.idnService.processingDocGeneration = true;

    this.content = [];

    //Get Sources Data
    let sourcesPromise = this.getAllSources();
    //TODO... get Data for other sections here

    //This is import we need await here until we get results of all data of promise before calling docxjs to genereate document
    let sources = await sourcesPromise;
    //TODO... await result of promise for other sections here

    //Heading of Sources section
    this.content.push(this.createHeading("Sources"));
    //Content (table) of Sources section
    this.content.push(this.createSourceSection(sources));

    //TODO... other sections should be added here

    //Simulation: taking long time to generate document
    //await this.sleep(100);

    const doc = new Document({
      sections: [{
          properties: {},
          children: this.content
      }],
    });

    const mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-IDN-Doc`;

    Packer.toBlob(doc).then(blob => {
      const docblob = blob.slice(0, blob.size, mimeType);
      saveAs(docblob, fileName);

      this.idnService.processingDocGeneration = false;
      this.messageService.add("IDN Document is generated successfully", false);
    });

  }

  async submitGenDocTask() {
    this.generateDoc();
    this.idnService.processingDocGeneration = true;

    while (true) {
      if (this.isProcessingDocGeneration() ) {
        console.log("Document generation is in progress.");

        this.readyForGenerate = false;
        for (let item of this.documentItems) {
            item.disabled = true;
        }

      } else {
        console.log("Document is generated.");
        for (let item of this.documentItems) {
          item.disabled = false;
          item.selected = false;
        }
        break;
      }
      await this.sleep(2*1000);
      this.messageService.clearAll();
      //this.idnService.processingDocGeneration = false;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isProcessingDocGeneration() {
    return this.idnService.processingDocGeneration;
  }

  downloadDocument() {
    return "hello";
  }


}
