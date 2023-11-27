import { Injectable } from '@angular/core';
import { FileUpload } from '../_models/file-upload';
import { Observable, finalize } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private basePath = '/uploads';

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) { }

  pushFileToStorage(fileUpload: FileUpload): Observable<number | undefined> {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          console.log("downloadURL");
          console.log(downloadURL);
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
        });
      })
    ).subscribe();

    return uploadTask.percentageChanges();
  }

  async pushCategoryPicToStorage(fileUpload: FileUpload,basePath, id): Promise<any>{
    const filePath = `${basePath}/${id}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);
   let url ="";
   await uploadTask.snapshotChanges().pipe(
      finalize(async () => {
        await  storageRef.getDownloadURL().subscribe(async downloadURL => {
          console.log("downloadURL");
          console.log(downloadURL);
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
        /*   await this.saveCategoryPicData(fileUpload, categoryId); */
          url = downloadURL;
        });
      })
    ).subscribe();
    return (await uploadTask).ref.getDownloadURL();
  }
  private async saveCategoryPicData(fileUpload: FileUpload, categoryId: string): Promise<void> {
    await this.db.collection("service").doc(categoryId).update({
      icon: fileUpload.url
    });
  }
  private saveFileData(fileUpload: FileUpload): void {
    //this.db.collection(this.basePath).push(fileUpload);
  }

/*   getFiles(numberItems: number): AngularFireList<FileUpload> {
    return this.db.list(this.basePath, ref =>
      ref.limitToLast(numberItems));
  } */
/* 
  deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<void> {
    return this.db.list(this.basePath).remove(key);
  } */

    deleteCategoryPicFromStorage(name: string): void {
    const storageRef = this.storage.ref("services");
    storageRef.child(name).delete();
  } 
}
