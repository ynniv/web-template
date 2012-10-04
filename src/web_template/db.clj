(ns web-template.db
  (:import org.openstreetmap.osmosis.hstore.PGHStore)
  (:require [clojure.java.jdbc :as sql]))

(def db-spec { :name "java:comp/env/jdbc/web-template" })
(defn switch-db-spec! [spec] (def db-spec spec))

(defn keywordize
  "convert dictionary keys into keywords"
  [d] (into {} (map (fn [[k v]] [(keyword k) v]) d)))

(defn unkeywordize
  "convert dictionary keys into strings"
  [d] (into {} (map (fn [[k v]] [(name k) v]) d)))

(defn expand-data
  "removes the :data attribute from a dictionary and adds those key/values to the dictionary"
  [r] (into (into {} (keywordize (:data r))) (dissoc r :data)))

(defn query [q]
  (sql/with-connection db-spec
    (sql/with-query-results rs
      q
      (into [] rs))))

(defn query-objects [q]
  (map expand-data (query q)))

(defn query-type [type]
  (query-objects ["select * from object where type = ?" (name type)]))

(defn query-id
  "query records for a given id, and optional type"
  ([id] (first (query-objects ["select * from object where id = ?" (Integer. id)])))
  ([id type] (first (query-objects ["select * from object where id = ? and type = ?" (Integer. id) (name type)]))))

(defn create-object [type data]
  (sql/with-connection db-spec
    (sql/insert-values :object [:type :data] [(name type) (PGHStore. (unkeywordize data))])))

(defn update-object [type id data]
  (sql/with-connection db-spec
    (sql/update-values :object
                       ["id=? and type=?" (Integer. id) (name type)]
                       { :data (PGHStore. data) })))

(defn delete-object [type id]
  (sql/with-connection db-spec
    (sql/delete-rows :object ["id=? and type=?" (Integer. id) (name type)])))
