import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookService, Book } from './book.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private bookService = inject(BookService);
  
  // Signaux pour l'état réactif
  books = signal<Book[]>([]);
  newBook: Book = { title: '', author: '', year: 2024 };
  isEditing = false; // Mode édition ?

  ngOnInit() {
    this.refreshBooks();
  }

  refreshBooks() {
    this.bookService.getBooks().subscribe({
      next: (data) => this.books.set(data),
      error: (err) => console.error('Erreur lors du chargement des livres', err)
    });
  }

  // Cette méthode gère soit l'ajout, soit la modification
  onSubmit() {
    if (this.isEditing && this.newBook.id) {
      // Cas : Modification
      this.bookService.updateBook(this.newBook.id, this.newBook).subscribe({
        next: () => {
          this.refreshBooks();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour :', err);
          alert('La mise à jour a échoué. Vérifie la console (F12).');
        }
      });
    } else {
      // Cas : Ajout
      this.bookService.addBook(this.newBook).subscribe({
        next: () => {
          this.refreshBooks();
          this.newBook = { title: '', author: '', year: 2024 };
        }
      });
    }
  }

  // Remplir le formulaire avec les infos du livre à modifier
  startEdit(book: Book) {
    this.isEditing = true;
    this.newBook = { ...book }; // On fait une copie pour ne pas modifier l'original en direct
  }

  cancelEdit() {
    this.isEditing = false;
    this.newBook = { title: '', author: '', year: 2024 };
  }

  deleteBook(id: number | undefined) {
    if (id !== undefined) {
      if (confirm('Voulez-vous vraiment supprimer ce livre ?')) {
        this.bookService.deleteBook(id).subscribe({
          next: () => this.refreshBooks(),
          error: (err) => console.error('Erreur lors de la suppression', err)
        });
      }
    }
  }
}
