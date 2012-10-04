(ns web-template.core
  (:use [clojure.data.json :only (read-json json-str)])
  (:require [noir.core :as noir]
            [noir.server :as server]
            [noir.response :as response]
            [compojure.core :as compojure]
            [ring.util.response :as ring-response]
            [web-template.db :as db]
            [clojure.java.jdbc :as sql]))

(let [db-host "localhost"
      db-port 5432
      db-name "web_template"
      db-user db-name
      db-pass db-name]
 
  (db/switch-db-spec! {:classname "org.postgresql.Driver" ; must be in classpath
                       :subprotocol "postgresql"
                       :subname (str "//" db-host ":" db-port "/" db-name)
                                        ; Any additional keys are passed to the driver
                                        ; as driver-specific properties.
                       :user db-user
                       :password db-pass}))

(noir/defpage "/object/:id" { :keys [id] }
  (json-str (db/query-id id)))

(noir/compojure-route
 (compojure/POST "/object/" request
                 (let [request-body (slurp (:body request))
                       data (read-json request-body)]
         (json-str (db/create-object (:type data) (dissoc data :type))))))

(noir/defpage "/" {}
  (into (ring-response/resource-response "index.html")
        { :headers { "Content-type" "text/html" } }))

(noir/defpage "*" { path :* }
  (ring-response/resource-response path))

(def ring-handler (server/gen-handler))

(defn -main [& args]
  (def *server (server/start 8080)))
