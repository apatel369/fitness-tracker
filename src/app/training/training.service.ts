import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Exercise } from './exercise.model';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private exercises: Exercise[] =  [];

  constructor(private db: AngularFirestore) {

  }

  fetchAvailableExercises() {
    this.db
    .collection('availableExercises')
    .snapshotChanges()
    .pipe(
      map(docArray => {
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
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
    });
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(exercise => exercise.id === selectedId);
    this.exerciseChanged.next({...this.runningExercise });
  }

  completeExercise() {
    this.exercises.push({...this.runningExercise, date: new Date(), state: 'completed'});
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.exercises.push({
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

  getCompleletedOrCancelledExercises() {
    return this.exercises.slice();
    console.log(this.exercises);
  }
}
