import { Component, OnInit } from '@angular/core';
import { saveAs} from 'file-saver';
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
import { Source } from '../model/source';
import { DocumentItem } from '../model/document-item';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';

@Component({
  selector: 'app-generate-doc',
  templateUrl: './generate-doc.component.html',
  styleUrls: ['./generate-doc.component.css']
})

export class GenerateDocComponent implements OnInit {
  content: any[];
  selectAll: boolean;
  documentItems: DocumentItem[];

  constructor(
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
  }

  reset(clearMsg: boolean) {
    this.content = [];
    this.documentItems = [];

    let allDoco = new DocumentItem();
    allDoco.name = "All";
    allDoco.description = "For all documents";
    allDoco.status = "";
    allDoco.disabled = false;
    allDoco.selected = false;
    this.documentItems.push(allDoco);

    let orgConfigDoco = new DocumentItem();
    orgConfigDoco.name = "Org Config";
    orgConfigDoco.description = "Only for org configuration";
    orgConfigDoco.status = "";
    orgConfigDoco.disabled = false;
    this.documentItems.push(orgConfigDoco);

    let identityProfilesDoco = new DocumentItem();
    identityProfilesDoco.name = "Identity Profiles";
    identityProfilesDoco.description = "Only for identy profiles";
    identityProfilesDoco.status = "";
    identityProfilesDoco.disabled = false;
    this.documentItems.push(identityProfilesDoco);

    let sourcesDoco = new DocumentItem();
    sourcesDoco.name = "Sources";
    sourcesDoco.description = "Only for sources";
    sourcesDoco.status = "";
    sourcesDoco.disabled = false;
    this.documentItems.push(sourcesDoco);

    let rulesDoco = new DocumentItem();
    rulesDoco.name = "Rules";
    rulesDoco.description = "Only for rules";
    rulesDoco.status = "";
    rulesDoco.disabled = false;
    this.documentItems.push(rulesDoco);

    let transformsDoco = new DocumentItem();
    transformsDoco.name = "Transforms";
    transformsDoco.description = "Only for transforms";
    transformsDoco.status = "";
    transformsDoco.disabled = false;
    this.documentItems.push(transformsDoco);

    if (clearMsg) {
      this.messageService.clearAll();
    } 
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    
    this.documentItems.forEach(each => {
      console.log("this.selectAll: " + !this.selectAll);
      each.selected = !this.selectAll;
      /*
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
      */
    });
  }

  changeOnSelect($event, index: number) {
    this.messageService.clearError();
    console.log("$event: " + $event);
    console.log("$event.target.checked: " + $event.target.checked);
    console.log("index: " + index);
    console.log("name: " + this.documentItems[index].name);

    if (this.documentItems[index].name == "All") {
      if ($event.target.checked == true) {
        console.log("selected: " + this.documentItems[index].selected);
        for (let item of this.documentItems) {
          if (item.name != "All") {
            item.disabled = true;
            item.selected = false;
          }
        }
      }
      else {
        for (let item of this.documentItems) {
          if (item.name != "All") {
            item.disabled = false;
          }
        }
      }
    }
    else {
      // disable All checkbox
      if ($event.target.checked == true) {
        for (let item of this.documentItems) {
          if (item.name == "All") {
            item.disabled = true;
            item.selected = false;
          }
        }
      }
    }

    // temp code for GUI
    this.idnService.processingDocGeneration = true;
    this.submitGenDocTask();
    
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
    //this.generateDoc();

    while (true) {
      if (this.isProcessingDocGeneration() ) {
        console.log("Document generation is in progress.");
      } else {
        console.log("Document is generated.");
        break;
      }
      await this.sleep(2*1000);
      this.idnService.processingDocGeneration = false;
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
