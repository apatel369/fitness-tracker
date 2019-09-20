import { NgModule } from '@angular/core';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { TrainingComponent } from './training.component';
import { CurrentTrainingComponent } from './current-training/current-training.component';
import { NewTrainingComponent } from './new-training/new-training.component';
import { PastTrainingComponent } from './past-training/past-training.component';
import { StopTrainingComponent } from './current-training/stop-training.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    TrainingComponent,
    CurrentTrainingComponent,
    NewTrainingComponent,
    PastTrainingComponent,
    StopTrainingComponent
  ],
  imports: [
    SharedModule,
    AngularFirestoreModule
   ],
  entryComponents: [StopTrainingComponent]
})
export class TrainingModule {}
