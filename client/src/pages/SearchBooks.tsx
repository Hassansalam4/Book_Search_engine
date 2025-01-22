import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row,
  Spinner,
} from "react-bootstrap";

import Auth from "../utils/auth";
import { SAVE_BOOK } from "../utils/mutations";
import { SEARCH_GOOGLE_BOOKS, GET_ME } from "../utils/queries";
import type { Book } from "../models/Book";

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);

  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const [searchGoogleBooks, { loading: searchLoading, data }] =
    useLazyQuery(SEARCH_GOOGLE_BOOKS);
  const [saveBook] = useMutation(SAVE_BOOK);

  useEffect(() => {
    if (userData?.me) {
      // Extract saved book IDs from the user's data
      const userSavedBookIds = userData.me.savedBooks.map(
        (book: Book) => book.bookId
      );
      setSavedBookIds(userSavedBookIds);
    }
  }, [userData]);

  useEffect(() => {
    if (data?.searchGoogleBooks) {
      setSearchedBooks(data.searchGoogleBooks);
    }
  }, [data]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      await searchGoogleBooks({ variables: { query: searchInput } });
      setSearchInput("");
    } catch (err) {
      console.error("Error searching Google Books:", err);
    }
  };

  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave) return;

    // Remove __typename field
    const { __typename, ...sanitizedBook } = bookToSave;

    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      return false;
    }

    try {
      await saveBook({
        variables: { input: sanitizedBook },
      });

      // Update savedBookIds after saving the book
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error("Error saving book:", err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        {searchLoading || userLoading ? (
          <div className="d-flex justify-content-center align-items-center pt-5">
            <Spinner animation="border" role="status" />
            <span className="ms-2">Loading...</span>
          </div>
        ) : (
          <>
            <h2 className="pt-5">
              {searchedBooks.length
                ? `Viewing ${searchedBooks.length} results:`
                : "Search for a book to begin"}
            </h2>
            <Row>
              {searchedBooks.map((book) => (
                <Col md="4" key={book.bookId}>
                  <Card border="dark">
                    {book.image && (
                      <Card.Img
                        src={book.image}
                        alt={`The cover for ${book.title}`}
                        variant="top"
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{book.title}</Card.Title>
                      <p className="small">
                        Authors: {book.authors.join(", ")}
                      </p>
                      <Card.Text>{book.description}</Card.Text>

                      <div className="d-flex flex-column">
                        {/* Google Books Link */}
                        <a
                          href={book.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info mb-2"
                        >
                          View on Google Books
                        </a>

                        {/* Save Button */}
                        {Auth.loggedIn() && (
                          <Button
                            disabled={savedBookIds?.some(
                              (savedBookId: string) =>
                                savedBookId === book.bookId
                            )}
                            className="btn-info"
                            onClick={() => handleSaveBook(book.bookId)}
                          >
                            {savedBookIds?.some(
                              (savedBookId: string) =>
                                savedBookId === book.bookId
                            )
                              ? "This book has already been saved!"
                              : "Save this Book!"}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </>
  );
};
