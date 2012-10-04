(defproject web-template "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :resource-paths ["www"]
  :ring { :handler web-template.core/ring-handler }
  :main web-template.core
  :plugins [[lein-swank "1.4.4"]
            [lein-ring "0.7.0"]]
  :dependencies [[org.clojure/clojure "1.3.0"]
                 [org.clojure/java.jdbc "0.1.4"]
                 [org.clojure/data.json "0.1.2"]
                 [org.clojars.technomancy/osmosis-hstore "0.2"]
                 [noir "1.2.2"]])
