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

  ngOnInit() {
    this.refreshBooks();
  }

  refreshBooks() {
    this.bookService.getBooks().subscribe({
      next: (data) => this.books.set(data),
      error: (err) => console.error('Erreur lors du chargement des livres', err)
    });
  }

  addBook() {
    if (this.newBook.title && this.newBook.author) {
      this.bookService.addBook(this.newBook).subscribe({
        next: () => {
          this.refreshBooks(); // Recharger la liste
          this.newBook = { title: '', author: '', year: 2024 }; // Reset formulaire
        },
        error: (err) => console.error('Erreur lors de l\'ajout', err)
      });
    }
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
