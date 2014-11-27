---
layout: post
title: "Preparing an iOS application for distribution manually"
description: "Generating an ipa file from an iOS application for distribution without exporting from Xcode"
date: 2014-11-27
author: mevanalles
categories: [ios, ipa, xcode]
keywords: "ios, ipa, xcode, xcodebuild, 2359media, 2359, engineering, mobile, feed, photos"
---

##Introduction
iPhone applications can be distributed mainly in 2 ways. Either via **AppStore** or through **AdHoc** (Enterprise or Personal). While each of these publication methods addresses different user base, both of these methods require the program to be compiled, build and exported through Xcode (or terminal using **`xcodebuild`**). Exporting an iPhone application requires 2 entities.

1. A *provisioning profile* which is a collection of entities listing down the allowed devices (or all devices), and developer information.
2. A *distribution certificate* to sign the application.

##Background
Usually the process of application submit / export through Xcode starts by creating an archive and this archive can be used to submit the application to Appstore directly or build an ipa file ready to be distributed manually. Often times when you’re working on client projects you do not always get the clients’ **itunesconnect** credentials to submit the application, instead you’re given provisioning file and distribution certificate to build and give the signed application (.ipa file) to client.

##Problem
Given the fact you only have those files, building the ipa has not been a problem so far. But starting with Xcode 6 exporting through archive requires you to sign into apple account. The purpose of this blog post is to give an alternate method to build the ipa file old fashion way which does not require to log into client’s apple account.

##Solution
I’ll be using a sample project to walkthrough the steps required to achieve this. What you will need?

+ A working iPhone project
+ A valid distribution provisioning profile and a valid certificate.

The project I’m using is configured to have 3 Build Configurations (`Debug`, `Adhoc`, `Appstore`) and 2 Schemes (`Development`, `Appstore`)


![config](/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/images/configs.png)
![schema](/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/images/schemas.png)

*Are you familiar with customising build profiles and schemas? Else I’d highly recommend to go through this [article](https://github.com/2359media/ios-dev-guide#staging-vs-production-vs-app-store) regarding build profiles and schemas written by my colleague, [Hu Junfeng](https://github.com/hujunfeng).*

Schema `Appstore` is using **appstore** build profile for all the options and `Development` schema is using **adhoc** for archive and **debug** for everything else, as shown below in the schema manager.

![Dev Archive](/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/images/dev-archive.png)
![Appstore Run](/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/images/appstore-run.png)

###1. Building the application file.

In this post I'll show 3 different methods to extract the application file, which can then be used to build our ipa file. First is by simply using the xcode build, second method is using xcode archive (see below) and thirdly using terminal.

**Steps for Xcode build option**

1. From the drop down menu for schemas in Xcode, select Appstore schema then select any iOS device besides a simulator.
2. Clean the project and you will notice the under the products, the target becomes red in color indicating its being cleaned out.


![production section 1](/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/images/product-section-1.png)

3. Build the project and this will build our application with appstore profile.
4. When the build is complete the target under product will be in black text.

![production section 2](/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/images/product-section-2.png)


5. Now right click, select show in Finder and copy this file.

###2. Generating ipa file.

1. With the target file copied, create a blank folder named ‘Payload’ (mind the case) on Desktop.
2. Paste the copied file into this folder.
3. Right click and select compress. This will create a zip file named `Payload.zip`
4. Rename this file to extension .ipa ( `Payload.ipa` )

###3. Clean up (important step)

File create at above step is almost ready to be distributed to appstore or by adhoc methods. But before that a clean up inside the ipa file should be performed. The reason is in mac os, a hidden system file named **.DS_Store** can exist within a folder. Typically this file is used to store icon positions, background image of the Folder. The important point is, unless you have hidden files shown in Finder, you will not see this file and the created zip archive will also contain this file making the ipa archive **invalid**. This hidden file can sometimes exist and sometimes not (*kind of like [Schrodinger’s file?](http://en.wikipedia.org/wiki/Schrödinger's_cat) *), therefore we must make sure to remove this file from the archive before we submit our ipa file.

There is ofcourse a way to delete this file from the Payload folder using terminal before creating the archive using the command `ls –a Payload/` to know it’s existance and issueing the command `rm .DS_Store` to remove it. However I’m going to use an edit command for zip utility on terminal to remove it from archive itself.
To do so, head over to terminal and navigate into the location where the archive ipa file is (Desktop in this case). Now issue this command on terminal.

    > zip –d Payload.ipa Payload/.DS_\*

<video autoplay="true" loop="false" width="100%"><source src="/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/videos/delete-hidden-file.m4v" type="video/x-m4v"></source><source src="/media/2014-11-27-preparing-an-ios-application-for-distribution-manually/videos/delete-hidden-file.webm" type="video/webm"></source></video>

What this command does is remove file under Payload folder starting with the `.DS_` resembling our hidden file. Now depending on the existance of the hidden system file, the output of the command will vary, either by informing the file did not exist or file has been removed.  Now that the hidden system file is cleaned up, archive is ready to be submitted.

### Building from Xcode Archive.
If you are using an Xcode archive you may want to try this method to copy out the application file instead.

1. From Xcode select Development schema (Remember the **Development** schema has **AdHoc** configuration for archive option).
2. From Xcode product menu select archive. Once the archive is built.
3. Open the xcode organizer (Window > Organizer) and select the archive that just finished building.
4. Right click & Show in Finder.
5. Right click again on the selected archive from Finder > Show package contents then drill down into Productcs > Applications.
6. Now copy this application file and follow from the step 2 in this article on Generating ipa file.

### Building from Terminal

Finally if you prefer to do all these steps using terminal you can follow this method instead. Keep in mind however that by using the terminal you will need to type in all parameters accordingly. In this example I will be using `Development` scheme and `AdHoc` build configuration to create an archive on the **desktop**.

From terminal navigate to the location where project is located.
To build **Xcode project** type in the command

    > xcodebuild -project ApplicationBuild.xcodeproj -scheme Development -configuration AdHoc -archivePath ~/Desktop/ApplicationBuild.xarchive archive

or for an Xcode Workspace enter the command

    > xcodebuild -workspace ApplicationBuild -scheme Development -configuration AdHoc -archivePath ~/Desktop/ApplicationBuild.xarchive archive

Now we use this archive to export the archive to ipa file,

    > xcodebuild -exportArchive -exportFormat IPA -archivePath ~/Desktop/ApplicationBuild.xarchive.xcarchive -exportPath ~/Desktop/ApplicationBuild.ipa


#Conclusion
Xcode 6 is using a lot of automated procedures to create, maintain and export developer profiles, provisioning and applications. This approach is great to keep things simple but does not work on situations where the developer does not have the credentials for itunesconnect account of client. In such situation methods described in this article can save the day to create ipa file from xcode project using only the provisioning file and certificate.


<!--*If you want to get an idea of the build profiles & schemas, the project file I've used can be found [here](https://www.github.com)*-->
