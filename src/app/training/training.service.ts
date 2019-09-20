import { Injectable } from '@angular/core';
import { Subject, Subscribable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Exercise } from './exercise.model';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore } from '@angular/fire/firestore';
import { UIService } from '../shared/ui.service';

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore, private uIService: UIService) {

  }

  fetchAvailableExercises() {
    this.uIService.loadingStateChanged.next(true);
    this.fbSubs.push(this.db
    .collection('availableExercises')
    .snapshotChanges()
    .pipe(
      map(docArray => {
        throw(new Error());
        return docArray.map(doc => {
          return {
            id: doc.payload.doc.id,
            name: doc.payload.doc.data()['name'],
            duration: doc.payload.doc.data()['duration'],
            calories: doc.payload.doc.data()['calories']
          };
        });
      })
    )
    .subscribe((exercises: Exercise[]) => {
      this.uIService.loadingStateChanged.next(false);
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
    }, error => {
      this.uIService.loadingStateChanged.next(false);
      this.uIService.showSnackbar('Fetching Exercises failed, please try again later', null, 3000);
      this.exercisesChanged.next(null);
    }));
  }

  startExercise(selectedId: string) {
    // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});
    this.runningExercise = this.availableExercises.find(exercise => exercise.id === selectedId);
    this.exerciseChanged.next({...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDB({...this.runningExercise, date: new Date(), state: 'completed'});
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDB({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories:  this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'});
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  fetchCompleletedOrCancelledExercises() {
    this.fbSubs.push(this.db.collection('finishedExercises').valueChanges().subscribe((exercises: Exercise[]) => {
      this.finishedExercisesChanged.next(exercises)}
      , error => {

      }));
  }

  private addDataToDB(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }

  cancelSubscriprions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }
}
